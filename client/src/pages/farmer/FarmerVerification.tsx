import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Clock, Upload, AlertTriangle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';

const NIGERIAN_BANKS = [
  'Access Bank',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'United Bank for Africa (UBA)',
  'First Bank of Nigeria',
  'Fidelity Bank',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Moniepoint MFB',
  'OPay Digital Services'
];

export const FarmerVerification: React.FC = () => {
  const { user, farm, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    // Step 1: ID
    id_type: 'National Identity Number (NIN)',
    id_number: '12345678901',
    id_document_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',

    // Step 2: Farm Information
    farm_name: farm?.farm_name || 'Obegu Integrated Agro Farms',
    state: farm?.state || 'Abia',
    lga: farm?.lga || 'Obingwa',
    address: farm?.address || 'KM 14 Aba-Port Harcourt Expressway, Obegu',
    farm_size: '12 Hectares',
    farm_type: 'Commercial Poultry & Grain Storage',

    // Step 3: Farm Documents & Cooperative
    cooperative_info: 'Abia State Poultry Farmers Cooperative Association (Member #AB-8421)',
    farm_documents: [
      'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=800'
    ],
    farm_photos: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800'
    ],

    // Step 4: Bank Details
    bank_name: 'Guaranty Trust Bank (GTBank)',
    bank_account_number: '0123456789',
    bank_account_name: 'Obegu Integrated Agro Ltd'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.farmers.submitOnboarding(form);
      setSuccess(true);
      await refreshUser();
    } catch (err: any) {
      alert(err.message || 'Failed to submit verification application');
    } finally {
      setSubmitting(false);
    }
  };

  const isVerified = farm?.status === 'VERIFIED';
  const isUnderReview = farm?.status === 'UNDER_REVIEW';

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-6 h-6 text-agro-600" />
          <h2 className="text-xl font-bold font-display text-agro-950">Farmer Verification & KYC</h2>
          <StatusBadge status={farm?.status || 'PENDING'} />
        </div>
        <p className="text-xs text-charcoal-600">
          Only verified commercial farmers with authentic KYC credentials can publish active produce to the AgroDirect marketplace.
        </p>
      </div>

      {isVerified ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-emerald-950 mb-2">Your Farm is Fully Verified!</h3>
          <p className="text-xs text-emerald-800 leading-relaxed mb-6">
            Congratulations! Your farm credentials, government identity, land documents, and bank account have been authenticated by AgroDirect Compliance Administrators. All your harvest listings are live for inter-state purchasing.
          </p>
          <div className="inline-flex items-center gap-2 bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified AgroDirect Producer Badge Active</span>
          </div>
        </div>
      ) : isUnderReview || success ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-amber-950 mb-2">Application Under Compliance Review</h3>
          <p className="text-xs text-amber-800 leading-relaxed mb-4">
            Your verification package has been submitted to the AgroDirect Admin review board. Our state field officers will verify your farm location and bank account within 24–48 hours.
          </p>
          <span className="text-[11px] font-semibold text-amber-900 bg-amber-200/60 px-4 py-1.5 rounded-full">
            Review Status: In Progress
          </span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-agro-100 shadow-card p-6 sm:p-8">
          {/* Multi-Step Indicator */}
          <div className="flex items-center justify-between mb-8 max-w-xl mx-auto">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === step
                      ? 'bg-agro-600 text-white ring-4 ring-agro-100'
                      : currentStep > step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-cream-200 text-charcoal-500'
                  }`}
                >
                  {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-10 sm:w-16 h-1 mx-1 rounded ${
                      currentStep > step ? 'bg-emerald-600' : 'bg-cream-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: ID Document */}
          {currentStep === 1 && (
            <div className="space-y-4 max-w-lg mx-auto">
              <h3 className="font-bold text-agro-950 text-base">Step 1 — Government Identity</h3>
              <p className="text-xs text-charcoal-600">Provide official identity documentation of the farm principal.</p>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">ID Type</label>
                <select
                  value={form.id_type}
                  onChange={e => setForm({ ...form, id_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs"
                >
                  <option>National Identity Number (NIN)</option>
                  <option>Voter's Card (INEC)</option>
                  <option>Driver's License (FRSC)</option>
                  <option>International Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">ID Document Number</label>
                <input
                  type="text"
                  placeholder="e.g. 11-digit NIN or ID number"
                  value={form.id_number}
                  onChange={e => setForm({ ...form, id_number: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm font-mono"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs rounded-xl"
                >
                  <span>Continue to Farm Info</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Farm Info */}
          {currentStep === 2 && (
            <div className="space-y-4 max-w-lg mx-auto">
              <h3 className="font-bold text-agro-950 text-base">Step 2 — Farm Location & Capacity</h3>
              <p className="text-xs text-charcoal-600">Specify physical agro production details.</p>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  value={form.farm_name}
                  onChange={e => setForm({ ...form, farm_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">LGA</label>
                  <input
                    type="text"
                    value={form.lga}
                    onChange={e => setForm({ ...form, lga: e.target.value })}
                    className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Farm Gate Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs rounded-xl"
                >
                  <span>Continue to Documents</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Cooperative & Documents */}
          {currentStep === 3 && (
            <div className="space-y-4 max-w-lg mx-auto">
              <h3 className="font-bold text-agro-950 text-base">Step 3 — Verification Documents & Cooperative</h3>
              <p className="text-xs text-charcoal-600">Agricultural cooperative membership or CAC registration.</p>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Cooperative Society / CAC Reg</label>
                <input
                  type="text"
                  value={form.cooperative_info}
                  onChange={e => setForm({ ...form, cooperative_info: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs"
                />
              </div>

              <div className="p-4 bg-cream-50 border border-agro-200 rounded-2xl">
                <span className="text-xs font-bold text-agro-950 block mb-1">Farm Documents & Facility Photos</span>
                <span className="text-[11px] text-charcoal-500 block mb-3">
                  Upload CAC certificate, Ministry of Agriculture registration, or farm pen photos.
                </span>
                <div className="flex items-center gap-2 text-xs text-agro-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3 proof documents staged for submission</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs rounded-xl"
                >
                  <span>Continue to Bank Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Bank Account */}
          {currentStep === 4 && (
            <div className="space-y-4 max-w-lg mx-auto">
              <h3 className="font-bold text-agro-950 text-base">Step 4 — Bank Account for Settlement</h3>
              <p className="text-xs text-charcoal-600">Earnings from confirmed sales will be settled to this account.</p>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Bank Name</label>
                <select
                  value={form.bank_name}
                  onChange={e => setForm({ ...form, bank_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs"
                >
                  {NIGERIAN_BANKS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">10-Digit NUBAN Account Number</label>
                <input
                  type="text"
                  maxLength={10}
                  value={form.bank_account_number}
                  onChange={e => setForm({ ...form, bank_account_number: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Verified Account Holder Name</label>
                <input
                  type="text"
                  value={form.bank_account_name}
                  onChange={e => setForm({ ...form, bank_account_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs rounded-xl"
                >
                  <span>Review & Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
              <h3 className="font-bold text-agro-950 text-base">Step 5 — Verification Summary</h3>
              <p className="text-xs text-charcoal-600">Please review all submitted information before submitting to Compliance.</p>

              <div className="bg-cream-50 rounded-2xl p-4 border border-agro-100 space-y-2 text-xs text-charcoal-700">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Farm:</span>
                  <span className="font-bold text-agro-950">{form.farm_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Location:</span>
                  <span>{form.lga} LGA, {form.state} State</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">ID Reference:</span>
                  <span className="font-mono">{form.id_type} ({form.id_number})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Bank Settlement:</span>
                  <span className="font-semibold">{form.bank_name} - {form.bank_account_number}</span>
                </div>
              </div>

              <div className="p-3 bg-agro-50 rounded-xl text-[11px] text-agro-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-agro-600 flex-shrink-0 mt-0.5" />
                <span>
                  By submitting, you certify that all information and farm photos provided are authentic and comply with AgroDirect producer quality standards.
                </span>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-agro-600 hover:bg-agro-700 disabled:bg-charcoal-200 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Verification Package'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
