import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { FarmerVerification } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminFarmerVerification: React.FC = () => {
  const [verifications, setVerifications] = useState<FarmerVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerif, setSelectedVerif] = useState<FarmerVerification | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | 'SUSPEND' | null>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.admin.listVerifications();
      setVerifications(data || []);
    } catch (err) {
      console.error('Failed to load farmer verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteReview = async () => {
    if (!selectedVerif || !reviewAction) return;
    try {
      setProcessing(true);
      await api.admin.reviewVerification(selectedVerif.id, reviewAction, reason);
      setFeedback(`Successfully processed action ${reviewAction} for farm application.`);
      setSelectedVerif(null);
      setReviewAction(null);
      setReason('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to review verification');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold font-display text-agro-950">Farmer Verification & KYC Queue</h2>
          </div>
          <p className="text-xs text-charcoal-600">
            Inspect farm land titles, government identity records, agricultural cooperative registrations, and bank verification.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
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

      {/* Queue Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm">Producer Applications ({verifications.length})</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading applications...</div>
        ) : verifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No pending verification records.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Farm Application</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Government ID</th>
                  <th className="px-6 py-4">Bank Account</th>
                  <th className="px-6 py-4">Cooperative / CAC</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {verifications.map(v => (
                  <tr key={v.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4 font-bold text-agro-950">
                      <span>Farm ID: {v.farm_id?.slice(0, 8) || 'N/A'}</span>
                      <span className="text-[10px] text-charcoal-400 block">Submitted {new Date(v.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold block">{v.id_type}</span>
                      <span className="font-mono text-charcoal-500 text-[11px]">{v.id_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-charcoal-900 block">{v.bank_name}</span>
                      <span className="font-mono text-[11px] text-charcoal-500">{v.bank_account_number} ({v.bank_account_name})</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-agro-900 font-semibold">{v.cooperative_info || 'Independent Commercial Farm'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedVerif(v)}
                        className="px-3.5 py-1.5 bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        Inspect & Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Review Modal */}
      {selectedVerif && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-agro-100 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-display text-agro-950">
                KYC Verification Inspection
              </h3>
              <StatusBadge status={selectedVerif.status} />
            </div>

            <div className="space-y-4 text-xs text-charcoal-700">
              <div className="grid grid-cols-2 gap-4 bg-cream-50 p-4 rounded-2xl border border-agro-100">
                <div>
                  <span className="text-charcoal-400 font-semibold block mb-1">Identity Document:</span>
                  <p className="font-bold text-agro-950">{selectedVerif.id_type}</p>
                  <p className="font-mono text-charcoal-600">{selectedVerif.id_number}</p>
                </div>
                <div>
                  <span className="text-charcoal-400 font-semibold block mb-1">Bank Settlement Payout:</span>
                  <p className="font-bold text-agro-950">{selectedVerif.bank_name}</p>
                  <p className="font-mono text-charcoal-600">{selectedVerif.bank_account_number}</p>
                  <p className="text-[11px] text-charcoal-500">{selectedVerif.bank_account_name}</p>
                </div>
              </div>

              <div>
                <span className="text-charcoal-400 font-semibold block mb-1">Agricultural Cooperative / CAC Certificate:</span>
                <p className="font-medium bg-cream-50 p-3 rounded-xl border border-agro-100">
                  {selectedVerif.cooperative_info || 'No cooperative affiliation declared'}
                </p>
              </div>

              {reviewAction && (
                <div className="p-4 bg-agro-50 rounded-2xl border border-agro-200 space-y-3">
                  <h4 className="font-bold text-agro-950">
                    Confirm Action: <span className="uppercase text-emerald-800">{reviewAction}</span>
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Audit Note / Reason
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add compliance notes (e.g., NIN verified against NIMC database, farm verified by field officer)..."
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-agro-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewAction(null)}
                      className="px-3 py-1.5 text-xs text-charcoal-600 hover:bg-cream-100 rounded-lg"
                    >
                      Cancel Action
                    </button>
                    <button
                      type="button"
                      disabled={processing}
                      onClick={handleExecuteReview}
                      className="px-5 py-1.5 bg-agro-700 hover:bg-agro-800 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      {processing ? 'Processing...' : 'Execute Decision'}
                    </button>
                  </div>
                </div>
              )}

              {!reviewAction && (
                <div className="pt-4 border-t border-agro-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedVerif(null)}
                    className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-xl"
                  >
                    Close Window
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewAction('REJECT')}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      Reject Application
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('APPROVE')}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                    >
                      Approve & Grant Verified Badge
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
