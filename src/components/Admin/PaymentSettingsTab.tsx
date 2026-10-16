import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  DollarSign,
  RefreshCw,
  Sliders,
  FileText,
  Check,
  X,
  Eye,
  Key,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { PaymentSettings, PaymentTransaction, PaymentProvider, VerificationStatus } from '../../types';
import {
  getPaymentSettings,
  savePaymentSettings,
  testPaymentConnection,
  getPaymentTransactions,
  uploadPayPalQRCode,
  updatePaymentVerificationStatus,
} from '../../services/paymentService';

export default function PaymentSettingsTab() {
  const [settings, setSettings] = useState<PaymentSettings>({
    enabled: true,
    provider: 'paypal',
    currency: 'USD',
    tax_percentage: 5,
    environment: 'sandbox',
    paypal_client_id: '',
    paypal_secret: '',
    paypal_link: 'https://paypal.me/blissyogawellness',
    qr_code_url: '',
    manual_instructions: 'Complete payment via PayPal portal link or scan the PayPal QR Code.',
  });

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Modal / Receipt view state
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      const setts = await getPaymentSettings();
      const txns = await getPaymentTransactions();
      setSettings(setts);
      setTransactions(txns);
    } catch (e) {
      console.warn('Error loading payment data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    await savePaymentSettings(settings);
    setSaveMessage('Payment gateway & API credentials saved successfully.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testPaymentConnection(settings.provider, settings);
    setTestResult(res);
    setTesting(false);
  };

  const handleStatusUpdate = async (txnId: string, status: VerificationStatus, note?: string) => {
    await updatePaymentVerificationStatus(txnId, status, note, note);
    const refreshed = await getPaymentTransactions();
    setTransactions(refreshed);
    if (selectedTxn && (selectedTxn.id === txnId || selectedTxn.transaction_id === txnId)) {
      setSelectedTxn(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#c5a059] border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#94a388]">Loading Payment Security Vault & Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#191c19] via-[#141714] to-[#121412] border border-white/10 glass-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94a388]">
                PayPal & Gateway Verification Center
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                settings.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {settings.enabled ? 'GATEWAY ACTIVE' : 'OFFLINE MODE'}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#f4f1ea]">
              PayPal Verification & Payment Settings
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={loadPaymentData}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#f4f1ea] flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gateway Configuration & Future-Proof API Keys */}
        <div className="bg-[#191c19] border border-white/10 p-6 rounded-3xl glass-card space-y-6">
          <h3 className="font-serif text-lg font-bold text-[#f4f1ea] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#c5a059]" /> PayPal & Merchant Gateway Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PayPal Payment Link */}
            <div>
              <label className="block text-xs font-semibold text-[#c5a059] mb-1">
                PayPal.me / Direct Payment Link
              </label>
              <input
                type="text"
                value={settings.paypal_link || ''}
                onChange={e => setSettings(prev => ({ ...prev, paypal_link: e.target.value }))}
                placeholder="https://paypal.me/blissyogawellness"
                className="w-full bg-[#121412] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-[#f4f1ea] focus:border-[#c5a059] outline-none"
              />
            </div>

            {/* PayPal QR Code Upload */}
            <div>
              <label className="block text-xs font-semibold text-[#c5a059] mb-1">
                PayPal QR Code Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.qr_code_url || ''}
                  onChange={e => setSettings(prev => ({ ...prev, qr_code_url: e.target.value }))}
                  placeholder="Data URL or image web path"
                  className="flex-1 bg-[#121412] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-[#f4f1ea] focus:border-[#c5a059] outline-none"
                />
                <label className="cursor-pointer px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-[#f4f1ea] shrink-0 flex items-center gap-1.5 transition-colors">
                  <span>Upload QR</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const uploadedUrl = await uploadPayPalQRCode(file);
                        if (uploadedUrl) {
                          setSettings(prev => ({ ...prev, qr_code_url: uploadedUrl }));
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Future-Proof Automated PayPal API Section */}
          <div className="p-5 rounded-2xl bg-[#121412] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#c5a059]" />
                <h4 className="font-serif font-bold text-xs text-[#f4f1ea] uppercase tracking-wider">
                  Future-Proof PayPal API Credentials (Automated Verification)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/60">Environment:</span>
                <select
                  value={settings.environment}
                  onChange={e => setSettings(prev => ({ ...prev, environment: e.target.value as any }))}
                  className="bg-[#191c19] border border-white/20 rounded-lg px-2.5 py-1 text-xs text-[#f4f1ea]"
                >
                  <option value="sandbox">Sandbox (Test Mode)</option>
                  <option value="production">Production (Live)</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              For manual transfers or personal PayPal accounts, submitted transactions default to <strong className="text-amber-300">Pending Manual Verification</strong> for admin approval via receipt screenshot.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  PayPal REST Client ID
                </label>
                <input
                  type="text"
                  value={settings.paypal_client_id || ''}
                  onChange={e => setSettings(prev => ({ ...prev, paypal_client_id: e.target.value }))}
                  placeholder="e.g. A21AA..."
                  className="w-full bg-[#191c19] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-[#f4f1ea] font-mono focus:border-[#c5a059] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  PayPal REST Secret Key
                </label>
                <input
                  type="password"
                  value={settings.paypal_secret || ''}
                  onChange={e => setSettings(prev => ({ ...prev, paypal_secret: e.target.value }))}
                  placeholder="••••••••••••••••••••"
                  className="w-full bg-[#191c19] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-[#f4f1ea] font-mono focus:border-[#c5a059] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Test & Save Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-xs font-semibold text-[#f4f1ea] transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-[#c5a059]" />
              {testing ? 'Testing API Credentials...' : 'Test PayPal API Credentials'}
            </button>

            <div className="flex items-center gap-3">
              {saveMessage && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {saveMessage}
                </span>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-[#121412] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-[#c5a059]/20"
              >
                Save Gateway Settings
              </button>
            </div>
          </div>

          {testResult && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
              testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </form>

      {/* Payment Transaction Ledger & Verification Dashboard */}
      <div className="bg-[#191c19] border border-white/10 rounded-3xl p-6 glass-card space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-serif text-lg font-bold text-[#f4f1ea] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c5a059]" /> Payment Transaction & Verification Ledger
          </h3>
          <span className="text-xs font-mono text-white/50">{transactions.length} Records</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center bg-[#121412] rounded-2xl border border-white/5 text-white/50 text-xs">
            No student payment confirmations logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121412]">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-white/5 text-[#94a388] uppercase text-[10px] font-semibold tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Program</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Payment Date</th>
                  <th className="p-3.5">Verification Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map(t => {
                  const vStatus = t.verification_status || (t.status === 'Paid' ? 'Verified' : 'Pending Verification');
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5">
                        <div className="font-semibold text-[#f4f1ea]">{t.student_name}</div>
                        <div className="text-[11px] text-white/50">{t.student_email}</div>
                      </td>
                      <td className="p-3.5 text-white/80 font-medium">{t.program_title}</td>
                      <td className="p-3.5 font-bold text-[#c5a059]">{t.currency || 'USD'} ${t.amount}</td>
                      <td className="p-3.5 font-mono text-white/90 font-bold">{t.transaction_id || t.transaction_ref || 'N/A'}</td>
                      <td className="p-3.5 text-white/60">{t.payment_date || new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider inline-block ${
                          vStatus === 'Verified'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : vStatus === 'Duplicate Transaction ID'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : vStatus === 'Invalid Transaction ID'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : vStatus === 'Failed' || vStatus === 'Rejected'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {vStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => {
                            setSelectedTxn(t);
                            setAdminNoteInput(t.admin_notes || t.notes || '');
                          }}
                          className="p-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                          title="View Proof & Verification Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(t.id, 'Verified', 'Verified by Admin')}
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          title="Verify & Approve Payment"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(t.id, 'Failed', 'Rejected by Admin')}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          title="Reject Payment"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification & Receipt Inspection Modal */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#191c19] border border-white/15 rounded-3xl p-6 max-w-lg w-full space-y-5 relative text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
                  <h3 className="font-serif font-bold text-base text-[#f4f1ea]">
                    Payment Verification Audit
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="p-1 rounded-full text-white/60 hover:text-white bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 bg-[#121412] p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between">
                  <span className="text-white/60">Student Name:</span>
                  <span className="font-bold text-[#f4f1ea]">{selectedTxn.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Email Address:</span>
                  <span className="font-medium text-white/90">{selectedTxn.student_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Program:</span>
                  <span className="font-medium text-[#c5a059]">{selectedTxn.program_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Amount Paid:</span>
                  <span className="font-serif font-bold text-sm text-[#c5a059]">
                    {selectedTxn.currency || 'USD'} ${selectedTxn.amount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Transaction ID:</span>
                  <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded text-xs">
                    {selectedTxn.transaction_id || selectedTxn.transaction_ref}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Payment Date:</span>
                  <span className="text-white/80">{selectedTxn.payment_date || new Date(selectedTxn.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Receipt Screenshot if uploaded */}
              {selectedTxn.receipt_url ? (
                <div className="space-y-2">
                  <label className="font-semibold text-white/80 block flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#c5a059]" /> Uploaded Receipt Screenshot:
                  </label>
                  <div className="p-2 rounded-2xl bg-[#121412] border border-white/10 text-center">
                    <img
                      src={selectedTxn.receipt_url}
                      alt="Uploaded Payment Receipt"
                      className="max-h-56 mx-auto rounded-xl object-contain border border-white/10"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center text-white/50 text-[11px]">
                  No receipt screenshot uploaded for this transaction.
                </div>
              )}

              {/* Admin Note Input */}
              <div>
                <label className="font-semibold text-white/80 block mb-1">Administrator Audit Notes</label>
                <textarea
                  rows={2}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="e.g. Verified on PayPal dashboard at 10:30 AM"
                  className="w-full bg-[#121412] border border-white/15 rounded-xl p-2.5 text-xs text-[#f4f1ea] focus:border-[#c5a059] outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedTxn.id, 'Failed', adminNoteInput || 'Rejected by Admin')}
                  className="flex-1 py-2.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/30 hover:bg-red-500/30 transition-all"
                >
                  Reject Payment
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedTxn.id, 'Verified', adminNoteInput || 'Verified by Admin')}
                  className="flex-1 py-2.5 rounded-full bg-emerald-500 text-[#121412] font-bold hover:bg-emerald-400 transition-all shadow-lg"
                >
                  Approve & Verify
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
