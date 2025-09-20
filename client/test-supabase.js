// Test Supabase connection
import { supabase } from './src/lib/supabase.js';

console.log('Environment check:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

// Test basic connection
async function testConnection() {
  try {
    console.log('Testing connection...');
    const { data, error } = await supabase.from('exams').select('count', { count: 'exact', head: true });
    console.log('Result:', { data, error });
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();
