'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/shared/lib/supabase/client';

interface RealtimeDebuggerProps {
  projectId: string | null;
}

export const RealtimeDebugger = ({ projectId }: RealtimeDebuggerProps) => {
  const [status, setStatus] = useState<string>('DISCONNECTED');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (!projectId) {
      setStatus('NO_PROJECT_ID');
      return;
    }


    setStatus('CONNECTING...');

    const channel = supabase
      .channel(`debug-messages-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta TODOS os eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {

          setLastMessage(payload);
          setMessageCount((c) => c + 1);
        }
      )
      .subscribe((subscriptionStatus, err) => {

        setStatus(subscriptionStatus);
        if (err) {

          setError(err.message || 'Unknown error');
        }
      });

    return () => {

      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Don't show in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-white/20 text-xs max-w-sm">
      <div className="font-bold mb-2">🔍 Realtime Debugger</div>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Status:</span>{' '}
          <span
            className={
              status === 'SUBSCRIBED'
                ? 'text-green-400 font-bold'
                : status.includes('ERROR')
                ? 'text-red-400 font-bold'
                : 'text-yellow-400'
            }
          >
            {status}
          </span>
        </div>

        {error && (
          <div className="text-red-400">
            <span className="text-gray-400">Error:</span> {error}
          </div>
        )}

        <div>
          <span className="text-gray-400">Messages Received:</span>{' '}
          <span className="text-blue-400 font-bold">{messageCount}</span>
        </div>

        {lastMessage && (
          <div className="mt-2 p-2 bg-white/10 rounded">
            <div className="text-gray-400 text-[10px]">Last Event:</div>
            <div className="text-[10px] mt-1">
              <div>Type: {lastMessage.eventType}</div>
              <div>Role: {lastMessage.new?.role}</div>
              <div>Content: {lastMessage.new?.content?.substring(0, 30)}...</div>
              <div>ID: {lastMessage.new?.id?.substring(0, 8)}...</div>
            </div>
          </div>
        )}

        <div className="mt-2 text-[10px] text-gray-500">
          ProjectID: {projectId?.substring(0, 8)}...
        </div>
      </div>
    </div>
  );
};
