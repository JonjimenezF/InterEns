import { createClient } from '@supabase/supabase-js';

// ⚠️ Reemplaza con tus credenciales reales del proyecto
export const SUPABASE_URL = 'https://icnabdpciheuucjpesln.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbmFiZHBjaWhldXVjanBlc2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njg5MjUsImV4cCI6MjA3MzQ0NDkyNX0.Lf8l8KclTXu3hzD0e3DxzoGQuuVfkUrZYyimvYUfUZ8';

// ✅ Exportamos el cliente para que pueda importarse en otros archivos
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
