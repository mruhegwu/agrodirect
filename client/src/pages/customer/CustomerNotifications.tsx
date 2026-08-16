import React from 'react';
import { Bell, CheckCheck, Clock, Package, Truck, ShieldAlert } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const CustomerNotifications: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Package className="w-4 h-4 text-agro-600" />;
      case 'DELIVERY':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'DISPUTE':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-harvest-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-agro-950 font-display">Notifications Inbox</h1>
          <p className="text-xs text-charcoal-500 mt-1">Real-time alerts on your orders, deliveries and payouts.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-xs font-bold text-agro-700 hover:text-agro-900 flex items-center space-x-1"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-xs text-charcoal-400">
          You have no notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                n.is_read
                  ? 'bg-white border-gray-100 text-charcoal-600'
                  : 'bg-agro-50/60 border-agro-200 text-charcoal-900 shadow-xs'
              }`}
            >
              <div className="p-2 bg-white rounded-xl shadow-xs mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 space-y-0.5 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-agro-950">{n.title}</h4>
                  <span className="text-[11px] text-charcoal-400 font-mono">
                    {new Date(n.created_at).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-charcoal-600 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
