import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getAuditLogs(50);
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-6 h-6 text-agro-700" />
            <h2 className="text-xl font-bold font-display text-agro-950">Immutable Security & Audit Logs</h2>
          </div>
          <p className="text-xs text-charcoal-600">
            Cryptographically timestamped audit trail of administrative approvals, settlement releases, and user state modifications.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50 flex items-center justify-between">
          <h3 className="font-bold text-agro-950 text-sm">Platform Audit Entries</h3>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            WORM (Write Once Read Many)
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No audit logs recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Entity Modified</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4 font-mono font-bold text-agro-950">
                      <span className="px-2 py-0.5 bg-agro-50 text-agro-800 rounded border border-agro-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-charcoal-900 block">{log.user_name || 'System Administrator'}</span>
                      <span className="text-[10px] text-charcoal-400">{log.user_role || 'ADMIN'}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-charcoal-600">
                      {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)})` : ''}
                    </td>
                    <td className="px-6 py-4 font-mono text-charcoal-500">{log.ip_address || '127.0.0.1'}</td>
                    <td className="px-6 py-4 text-right text-charcoal-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
