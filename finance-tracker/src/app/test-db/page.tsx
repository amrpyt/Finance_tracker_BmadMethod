import { supabase } from '@/lib/database';

export default async function TestDB() {
  let connectionStatus = 'Unknown';
  let error = '';

  try {
    // Test database connection with Supabase
    const { data, error: supabaseError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (supabaseError) {
      throw supabaseError;
    }
    
    connectionStatus = 'Connected';
  } catch (e) {
    connectionStatus = 'Failed';
    error = e instanceof Error ? e.message : 'Unknown error';
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>Status:</strong> {connectionStatus}</p>
        {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
        <p className="text-sm text-gray-600 mt-2">
          Note: Connection will fail until valid Supabase credentials are configured in .env
        </p>
      </div>
    </div>
  );
}
