"""Doble de Supabase 100% en memoria para la suite de tests.

Implementa exactamente la superficie que usa la aplicación:
`client.auth.*` y `client.table(...).select/insert/update/delete.eq.order.limit.execute()`
evitando cualquier llamada de red.
"""

from types import SimpleNamespace


class FakeResult:
    def __init__(self, data):
        self.data = data


class FakeTable:
    def __init__(self, store, name):
        self._store = store
        self._name = name
        self._op = "select"
        self._payload = None
        self._filters = []
        self._order = None
        self._limit = None

    # --- builders -------------------------------------------------
    def _start(self, op):
        self._op = op
        self._payload = None
        self._filters = []
        self._order = None
        self._limit = None
        return self

    def select(self, *_args, **_kwargs):
        return self._start("select")

    def insert(self, data):
        self._start("insert")
        self._payload = data
        return self

    def update(self, data):
        self._start("update")
        self._payload = data
        return self

    def delete(self):
        return self._start("delete")

    def eq(self, column, value):
        self._filters.append((column, value))
        return self

    def order(self, column, desc=False):
        self._order = (column, desc)
        return self

    def limit(self, value):
        self._limit = value
        return self

    # --- ejecución ------------------------------------------------
    def _rows(self):
        return self._store.tables.setdefault(self._name, [])

    def _matches(self, row):
        return all(row.get(col) == val for col, val in self._filters)

    def execute(self):
        rows = self._rows()
        result = FakeResult([])

        if self._op == "insert":
            payload = self._payload
            if isinstance(payload, list):
                nuevos = [self._insert_one(r) for r in payload]
            else:
                nuevos = [self._insert_one(payload)]
            result = FakeResult(nuevos)

        elif self._op == "update":
            afectados = [r for r in rows if self._matches(r)]
            for row in afectados:
                row.update(self._payload)
            result = FakeResult([dict(r) for r in afectados])

        elif self._op == "delete":
            afectados = [r for r in rows if self._matches(r)]
            self._store.tables[self._name] = [r for r in rows if not self._matches(r)]
            result = FakeResult([dict(r) for r in afectados])

        else:  # select
            seleccion = [dict(r) for r in rows if self._matches(r)]
            if self._order:
                col, desc = self._order
                seleccion.sort(key=lambda r: (r.get(col) is None, r.get(col)), reverse=desc)
            if self._limit is not None:
                seleccion = seleccion[: self._limit]
            result = FakeResult(seleccion)

        # El builder real de Supabase no se reutiliza: limpiamos estado.
        self._op = "select"
        self._payload = None
        self._filters = []
        self._order = None
        self._limit = None
        return result

    def _insert_one(self, data):
        rows = self._rows()
        fila = dict(data)
        fila.setdefault("id", (max((r["id"] for r in rows), default=0) + 1))
        rows.append(fila)
        return dict(fila)


class FakeAuth:
    def __init__(self, store):
        self._store = store

    # --- helpers --------------------------------------------------
    def _nuevo_token(self, auth_id):
        token = f"access-token-{self._store.contador_tokens}"
        self._store.contador_tokens += 1
        self._store.tokens[token] = auth_id
        return token

    def _nuevo_refresh(self, auth_id):
        token = f"refresh-token-{self._store.contador_tokens}"
        self._store.contador_tokens += 1
        self._store.refresh_tokens[token] = auth_id
        return token

    def _usuario(self, auth_id):
        return next(
            (u for u in self._store.auth_users if u["id"] == auth_id),
            None,
        )

    # --- API usada por la app --------------------------------------
    def sign_up(self, credentials):
        email = credentials["email"]
        if any(u["email"] == email for u in self._store.auth_users):
            raise Exception("User already registered")
        if len(credentials.get("password", "")) < 6:
            raise Exception("Password should be at least 6 characters")

        auth_id = f"user-{len(self._store.auth_users) + 1}"
        confirmado = None if self._store.requiere_confirmacion else "2026-01-01T00:00:00Z"
        self._store.auth_users.append(
            {
                "id": auth_id,
                "email": email,
                "password": credentials.get("password"),
                "email_confirmed_at": confirmado,
            }
        )
        user = SimpleNamespace(
            id=auth_id, email=email, email_confirmed_at=confirmado
        )
        return SimpleNamespace(user=user, session=None)

    def sign_in_with_password(self, credentials):
        email = credentials["email"]
        user = next((u for u in self._store.auth_users if u["email"] == email), None)
        if user is None or user["password"] != credentials["password"]:
            raise Exception("Invalid login credentials")

        access = self._nuevo_token(user["id"])
        refresh = self._nuevo_refresh(user["id"])
        session = SimpleNamespace(access_token=access, refresh_token=refresh)
        return SimpleNamespace(
            session=session,
            user=SimpleNamespace(id=user["id"], email=user["email"]),
        )

    def get_user(self, jwt=None):
        auth_id = self._store.tokens.get(jwt)
        if auth_id is None:
            raise Exception("invalid JWT: no matching user")
        user = self._usuario(auth_id)
        if user is None:
            raise Exception("invalid JWT: no matching user")
        return SimpleNamespace(
            user=SimpleNamespace(
                id=user["id"],
                email=user["email"],
                email_confirmed_at=user["email_confirmed_at"],
            )
        )

    def refresh_session(self, refresh_token=None):
        auth_id = self._store.refresh_tokens.get(refresh_token)
        if auth_id is None:
            raise Exception("invalid refresh token")
        del self._store.refresh_tokens[refresh_token]
        access = self._nuevo_token(auth_id)
        refresh = self._nuevo_refresh(auth_id)
        user = self._usuario(auth_id)
        return SimpleNamespace(
            session=SimpleNamespace(access_token=access, refresh_token=refresh),
            user=SimpleNamespace(id=user["id"], email=user["email"]),
        )


class FakeSupabase:
    """Sustituto del cliente `supabase` de producción."""

    def __init__(self, requiere_confirmacion=False):
        self.store = SimpleNamespace(
            tables={},
            auth_users=[],
            tokens={},
            refresh_tokens={},
            contador_tokens=1,
            requiere_confirmacion=requiere_confirmacion,
        )
        self.auth = FakeAuth(self.store)

    def table(self, name):
        return FakeTable(self.store, name)
