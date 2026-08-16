import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, DollarSign, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export const AdminSettings: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [form, setForm] = useState({
    platform_fee_percent: 5.0,
    packaging_fee_default: 1500,
    minimum_withdrawal_amount: 5000,
    settlement_delay_hours: 24,
    dispute_window_days: 3,
    paystack_live_enabled: true,
    flutterwave_live_enabled: true
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.admin.updateSetting('platform_fee_percent', form.platform_fee_percent);
      await api.admin.updateSetting('packaging_fee_default', form.packaging_fee_default);
      await api.admin.updateSetting('minimum_withdrawal_amount', form.minimum_withdrawal_amount);
      setFeedback('Platform settings and financial parameters updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-agro-950">Platform Financial Rules & Configurations</h2>
        <p className="text-xs text-charcoal-600">
          Configure marketplace commission percentages, withdrawal thresholds, and escrow release windows.
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
          <h3 className="font-bold text-agro-950 text-sm mb-3">Marketplace Financial Rules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Marketplace Commission Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={form.platform_fee_percent}
                onChange={e => setForm({ ...form, platform_fee_percent: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-agro-500"
                required
              />
              <span className="text-[10px] text-charcoal-500 mt-1 block">Default MVP value: 5.0%</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Minimum Bank Withdrawal (₦)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={form.minimum_withdrawal_amount}
                onChange={e => setForm({ ...form, minimum_withdrawal_amount: parseInt(e.target.value) || 5000 })}
                className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-agro-500"
                required
              />
              <span className="text-[10px] text-charcoal-500 mt-1 block">Minimum balance required for farmer disbursement</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm mb-3">Escrow & Dispute Windows</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Escrow Settlement Clearance Delay (Hours)
              </label>
              <input
                type="number"
                min="0"
                value={form.settlement_delay_hours}
                onChange={e => setForm({ ...form, settlement_delay_hours: parseInt(e.target.value) || 24 })}
                className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:ring-2 focus:ring-agro-500"
              />
              <span className="text-[10px] text-charcoal-500 mt-1 block">Hours after delivery before funds become eligible</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Customer Dispute Claim Window (Days)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={form.dispute_window_days}
                onChange={e => setForm({ ...form, dispute_window_days: parseInt(e.target.value) || 3 })}
                className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:ring-2 focus:ring-agro-500"
              />
              <span className="text-[10px] text-charcoal-500 mt-1 block">Allowed days post-delivery to log a claim</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-agro-50 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-agro-600 hover:bg-agro-700 disabled:bg-charcoal-200 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
