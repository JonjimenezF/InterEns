import { createClient } from '@supabase/supabase-js';

// 🔐 Credenciales del proyecto Supabase
export const SUPABASE_URL = 'https://icnabdpciheuucjpesln.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbmFiZHBjaWhldXVjanBlc2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njg5MjUsImV4cCI6MjA3MzQ0NDkyNX0.Lf8l8KclTXu3hzD0e3DxzoGQuuVfkUrZYyimvYUfUZ8';

// 🚀 Cliente Supabase configurado con soporte moderno
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'interens' }
  }
});
