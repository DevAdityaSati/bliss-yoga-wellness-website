import { createClient } from '@supabase/supabase-js';

// Supabase configuration for Bliss Yoga & Wellness
// Project Ref: yqgffpxiydscfoljrbaw
// Project URL: https://yqgffpxiydscfoljrbaw.supabase.co
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yqgffpxiydscfoljrbaw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZ2ZmcHhpeWRzY2ZvbGpyYmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzQ4MzksImV4cCI6MjEwMDQ1MDgzOX0.EjJQra2lNK8S0lHbkMWTQ9ob0HV9AsXxAMO9YMHIdlU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function isSupabaseConfigured(): boolean {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
  return Boolean(key && key.length > 10 && !key.includes('placeholder'));
}
