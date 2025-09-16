import React from 'react';

export const EnvCheck: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-bold mb-2">Environment Variables Check</h2>
      <div className="space-y-2">
        <div>
          <strong>URL:</strong> {supabaseUrl || 'NOT SET'}
        </div>
        <div>
          <strong>Key:</strong> {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET'}
        </div>
      </div>
    </div>
  );
};