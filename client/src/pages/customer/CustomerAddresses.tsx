import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, Home, Building2, Phone } from 'lucide-react';

interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  state: string;
  lga: string;
  isDefault: boolean;
  deliveryInstructions?: string;
}

const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'Home (Lagos)',
    fullName: 'Emeka Okonkwo',
    phone: '+234 802 345 6789',
    streetAddress: '14 Admiralty Way, Lekki Phase 1',
    state: 'Lagos',
    lga: 'Eti-Osa',
    isDefault: true,
    deliveryInstructions: 'Call upon arrival at the security gate.'
  },
  {
    id: 'addr-2',
    label: 'Restaurant / Business Hub',
    fullName: 'Emeka Okonkwo',
    phone: '+234 803 111 2233',
    streetAddress: '28 Isaac John Street, GRA',
    state: 'Lagos',
    lga: 'Ikeja',
    isDefault: false,
    deliveryInstructions: 'Deliver to back kitchen cold storage loading dock.'
  }
];

const NIGERIAN_STATES = [
  'Lagos', 'Abia', 'Abuja (FCT)', 'Anambra', 'Enugu', 'Rivers', 'Imo', 'Ogun', 'Oyo', 'Delta', 'Kano', 'Kaduna', 'Edo'
];

export const CustomerAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<SavedAddress[]>(INITIAL_ADDRESSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    streetAddress: '',
    state: 'Lagos',
    lga: '',
    isDefault: false,
    deliveryInstructions: ''
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      label: 'Home',
      fullName: '',
      phone: '',
      streetAddress: '',
      state: 'Lagos',
      lga: '',
      isDefault: addresses.length === 0,
      deliveryInstructions: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: SavedAddress) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      streetAddress: addr.streetAddress,
      state: addr.state,
      lga: addr.lga,
      isDefault: addr.isDefault,
      deliveryInstructions: addr.deliveryInstructions || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.streetAddress || !form.state || !form.lga) {
      alert('Please fill in all required address fields.');
      return;
    }

    if (editingId) {
      setAddresses(prev =>
        prev.map(a => {
          if (a.id === editingId) {
            return { ...a, ...form };
          }
          if (form.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        })
      );
    } else {
      const newAddr: SavedAddress = {
        id: `addr-${Date.now()}`,
        ...form
      };
      if (form.isDefault) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddr));
      } else {
        setAddresses(prev => [...prev, newAddr]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev =>
      prev.map(a => ({
        ...a,
        isDefault: a.id === id
      }))
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-6 h-6 text-agro-600" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-agro-950">Delivery Addresses</h1>
          </div>
          <p className="text-charcoal-600 text-sm">
            Manage your inter-state and local delivery locations for direct farm produce shipments.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-agro-600 hover:bg-agro-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map(addr => (
          <div
            key={addr.id}
            className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all shadow-sm ${
              addr.isDefault
                ? 'border-agro-500 ring-2 ring-agro-500/10'
                : 'border-agro-100 hover:border-agro-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cream-100 text-agro-700 rounded-lg">
                    {addr.label.toLowerCase().includes('office') || addr.label.toLowerCase().includes('business') ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <Home className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-bold text-agro-950">{addr.label}</span>
                </div>

                {addr.isDefault ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-agro-50 text-agro-700 rounded-full border border-agro-200">
                    <CheckCircle2 className="w-3 h-3 text-agro-600" />
                    Default
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs text-charcoal-500 hover:text-agro-700 underline"
                  >
                    Set as default
                  </button>
                )}
              </div>

              <p className="font-semibold text-charcoal-900 text-sm mb-1">{addr.fullName}</p>
              <p className="text-xs text-charcoal-600 flex items-center gap-1.5 mb-2">
                <Phone className="w-3 h-3 text-charcoal-400" />
                {addr.phone}
              </p>
              <p className="text-sm text-charcoal-700 leading-relaxed mb-1">{addr.streetAddress}</p>
              <p className="text-xs font-medium text-agro-800">
                {addr.lga} LGA, {addr.state} State, Nigeria
              </p>

              {addr.deliveryInstructions && (
                <div className="mt-3 p-2.5 bg-cream-50 rounded-xl border border-agro-50 text-xs text-charcoal-600 italic">
                  "{addr.deliveryInstructions}"
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-agro-50 flex items-center justify-end gap-3">
              <button
                onClick={() => handleOpenEdit(addr)}
                className="flex items-center gap-1.5 text-xs text-charcoal-600 hover:text-agro-700 font-medium transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(addr.id)}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-agro-100 my-8">
            <h2 className="text-xl font-bold font-display text-agro-950 mb-4">
              {editingId ? 'Edit Address' : 'Add Delivery Address'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Address Label</label>
                <input
                  type="text"
                  placeholder="e.g. Home, Restaurant, Store Warehouse"
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">State</label>
                  <select
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                    required
                  >
                    {NIGERIAN_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Local Govt. Area (LGA)</label>
                  <input
                    type="text"
                    placeholder="e.g. Eti-Osa, Ikeja, Aba South"
                    value={form.lga}
                    onChange={e => setForm({ ...form, lga: e.target.value })}
                    className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Street Address</label>
                <textarea
                  rows={2}
                  placeholder="Street name, house number, landmarks..."
                  value={form.streetAddress}
                  onChange={e => setForm({ ...form, streetAddress: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="Gate code, cold storage loading instructions..."
                  value={form.deliveryInstructions}
                  onChange={e => setForm({ ...form, deliveryInstructions: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                  className="rounded text-agro-600 focus:ring-agro-500 h-4 w-4"
                />
                <label htmlFor="isDefault" className="text-xs text-charcoal-700 font-medium">
                  Set as default delivery address
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-charcoal-600 hover:bg-cream-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-agro-600 hover:bg-agro-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
