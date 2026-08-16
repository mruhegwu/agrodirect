import React, { useState } from 'react';
import { Settings, Bell, Package, Clock, ShieldCheck, CheckCircle2, Save } from 'lucide-react';

export const FarmerSettings: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_alerts: true,
    whatsapp_order_pings: true,
    lead_time_hours: 24,
    default_packaging_type: 'Ventilated Poultry Crates / Thermal Insulated Boxes',
    auto_confirm_orders: false,
    allow_bulk_rfq: true
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setFeedback('Farm preferences and notification settings saved successfully.');
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-agro-950">Farm Operational Settings</h2>
        <p className="text-xs text-charcoal-600">
          Configure order alerts, harvesting lead times, and default produce packaging options.
        </p>
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

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-agro-100 p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <h3 className="font-bold text-agro-950 text-sm mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-agro-600" />
            <span>Order Notifications & Alerts</span>
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-cream-50 rounded-2xl cursor-pointer">
              <div>
                <span className="font-semibold text-xs text-charcoal-900 block">Instant Email Notifications</span>
                <span className="text-[11px] text-charcoal-500">Receive order dispatch manifests and payment slips via email</span>
              </div>
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={e => setSettings({ ...settings, email_notifications: e.target.checked })}
                className="h-4 w-4 rounded text-agro-600 focus:ring-agro-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-cream-50 rounded-2xl cursor-pointer">
              <div>
                <span className="font-semibold text-xs text-charcoal-900 block">SMS Order Alerts</span>
                <span className="text-[11px] text-charcoal-500">Get SMS pings when a customer places an urgent order</span>
              </div>
              <input
                type="checkbox"
                checked={settings.sms_alerts}
                onChange={e => setSettings({ ...settings, sms_alerts: e.target.checked })}
                className="h-4 w-4 rounded text-agro-600 focus:ring-agro-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-cream-50 rounded-2xl cursor-pointer">
              <div>
                <span className="font-semibold text-xs text-charcoal-900 block">WhatsApp Logistics Sync</span>
                <span className="text-[11px] text-charcoal-500">Direct pickup alerts with driver phone numbers via WhatsApp</span>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsapp_order_pings}
                onChange={e => setSettings({ ...settings, whatsapp_order_pings: e.target.checked })}
                className="h-4 w-4 rounded text-agro-600 focus:ring-agro-500"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-agro-600" />
            <span>Fulfillment & Preparation Time</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Standard Preparation Window (Hours)
              </label>
              <select
                value={settings.lead_time_hours}
                onChange={e => setSettings({ ...settings, lead_time_hours: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs"
              >
                <option value={12}>12 Hours (Rapid Dispatch)</option>
                <option value={24}>24 Hours (Standard Harvesting)</option>
                <option value={48}>48 Hours (Large Livestock / Custom Dressing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Default Packaging Standard
              </label>
              <input
                type="text"
                value={settings.default_packaging_type}
                onChange={e => setSettings({ ...settings, default_packaging_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-agro-50 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-agro-600 hover:bg-agro-700 disabled:bg-charcoal-200 text-white font-bold text-xs rounded-xl transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
