import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kgqbvkaplnvajctgkaut.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncWJ2a2FwbG52YWpjdGdrYXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODkyMjIsImV4cCI6MjA5MDM2NTIyMn0.3v4XvGjgxHw8Z4MRcd7i6TX2Nc6F57W-DhcQFcs7eYM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})

export default supabase
