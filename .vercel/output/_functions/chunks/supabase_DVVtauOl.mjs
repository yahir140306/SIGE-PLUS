import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://iyfydkgtfeyxprlftvdv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Znlka2d0ZmV5eHBybGZ0dmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNDA5NTgsImV4cCI6MjA4NzkxNjk1OH0.xjdjZ-nf9y0MwdTknHVKHevFipcygtZRjbEB3TJ4ngs";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase as s };
