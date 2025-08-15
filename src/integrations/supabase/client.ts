import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qydkezeghsmbyrbnvpmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5ZGtlemVnaHNtYnlyYm52cG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTk3NDksImV4cCI6MjA3MDc3NTc0OX0.YjfwdPpDWOpNtKZ6_oN7ISdwS-O7pmLkWu0kV1eeC9E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});