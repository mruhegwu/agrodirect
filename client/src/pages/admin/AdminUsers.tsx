import React, { useEffect, useState } from 'react';
import { Users, Search, Filter, ShieldCheck, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.admin.listUsers(roleFilter || undefined, searchQuery || undefined);
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user: User) => {
    try {
      await api.admin.toggleUserStatus(user.id, !user.is_active);
      setFeedback(`Updated status for ${user.full_name} to ${!user.is_active ? 'Active' : 'Suspended'}.`);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">User Management & Access Control</h2>
          <p className="text-xs text-charcoal-600">
            RBAC authorization roles: Customer, Farmer, Logistics Carrier, and Marketplace Admin.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-agro-100 p-4 shadow-card flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by full name, email, phone number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadUsers()}
            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500 w-full sm:w-auto"
          >
            <option value="">All User Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="FARMER">Farmer</option>
            <option value="LOGISTICS_PROVIDER">Logistics Provider</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading user registry...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4">
                      <span className="font-bold text-agro-950 block">{u.full_name}</span>
                      <span className="text-charcoal-500 text-[11px]">{u.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-50 text-purple-700'
                          : u.role === 'FARMER'
                          ? 'bg-emerald-50 text-emerald-700'
                          : u.role === 'LOGISTICS_PROVIDER'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-cream-100 text-charcoal-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{u.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                          u.is_active
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_active ? 'Suspend' : 'Reactivate'}
                      </button>
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
