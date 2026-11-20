import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://eiirdtmlmnitfnhgkrcw.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpaXJkdG1sbW5pdGZuaGdrcmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NTY4ODIsImV4cCI6MjA5MzUzMjg4Mn0.Q2N8FOOwsMHjkE_rmrZVjxw9KzvioxVo7w_zdPYQajI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);