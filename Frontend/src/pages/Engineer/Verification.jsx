import React, { useState, useEffect } from 'react';
import {
  BadgeCheck, Clock, AlertCircle, FileText, UploadCloud,
  CheckCircle2, XCircle, ShieldCheck,
} from 'lucide-react';
import { engineerService } from '../../services/engineerService';
import { cn } from '../../utils/cn';

const Verification = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    licenseNumber: '',
    yearsOfExperience: '',
    licenseFileUrl: '',
    licenseFileName: '',
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await engineerService.getVerificationStatus();
        if (active) {
          setStatus(res.data);
          setForm((f) => ({
            ...f,
            licenseNumber: res.data.licenseNumber || '',
            licenseFileUrl: res.data.licenseFile?.url || '',
            licenseFileName: res.data.licenseFile?.name || '',
          }));
        }
      } catch (e) {
        if (active) setError('Failed to load verification status');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await engineerService.submitVerification({
        licenseNumber: form.licenseNumber,
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
        licenseFile: { url: form.licenseFileUrl, name: form.licenseFileName },
      });
      setStatus({ ...status, ...res.data });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
          <div className="h-40 bg-slate-200 rounded-4xl" />
        </div>
      </div>
    );
  }

  const current = status?.verificationStatus || 'pending';
  const isApproved = current === 'approved';
  const isRejected = current === 'rejected';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-gold" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-navy">Professional Verification</h1>
          <p className="text-slate-600 font-medium">Verify your credentials to unlock more client opportunities</p>
        </div>
      </div>

      {/* Status banner */}
      <div className={cn(
        'rounded-4xl border p-6 mb-8 flex items-start gap-4',
        isApproved ? 'bg-emerald-50 border-emerald-200' :
        isRejected ? 'bg-red-50 border-red-200' :
        'bg-amber-50 border-amber-200'
      )}>
        {isApproved ? <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" /> :
         isRejected ? <XCircle className="w-8 h-8 text-red-500 shrink-0" /> :
         <Clock className="w-8 h-8 text-amber-600 shrink-0" />}
        <div>
          <h2 className="font-bold text-navy text-lg capitalize">{current}</h2>
          <p className="text-sm text-slate-600">
            {isApproved
              ? 'Your profile is verified. You can now appear in verified engineer search results.'
              : isRejected
                ? 'Your verification was rejected. Review the reason and resubmit with the required corrections.'
                : 'Your verification is under review by our admin team. This usually takes 1-3 business days.'}
          </p>
        </div>
      </div>

      {isRejected && status?.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-8">
          <p className="font-bold text-red-700 mb-1">Rejection reason</p>
          <p className="text-slate-600">{status.rejectionReason}</p>
        </div>
      )}

      {/* Submit form */}
      {!isApproved && (
        <form onSubmit={handleSubmit} className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-gold" /> Submit Verification
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">License Number</label>
              <input
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                required
                className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40"
                placeholder="e.g. COA/2024/12345"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Years of Experience</label>
              <input
                type="number"
                min="0"
                value={form.yearsOfExperience}
                onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
                className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40"
                placeholder="e.g. 8"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">License File URL</label>
              <div className="flex items-center gap-3">
                <input
                  value={form.licenseFileUrl}
                  onChange={(e) => setForm({ ...form, licenseFileUrl: e.target.value })}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40"
                  placeholder="Paste uploaded license file URL"
                />
                <UploadCloud className="w-6 h-6 text-slate-400 shrink-0" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Upload your license document via the upload tool, then paste its URL here.</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">License File Name</label>
              <input
                value={form.licenseFileName}
                onChange={(e) => setForm({ ...form, licenseFileName: e.target.value })}
                className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40"
                placeholder="e.g. license-certificate.pdf"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 btn-gold px-8 py-4 text-lg font-bold shadow-xl hover:shadow-gold/20 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <BadgeCheck className="w-5 h-5" />
            {submitting ? 'Submitting...' : status ? 'Resubmit Verification' : 'Submit Verification'}
          </button>
        </form>
      )}

      {/* How it works */}
      <div className="mt-10 bg-slate-50 border border-slate-200 rounded-4xl p-8">
        <h4 className="font-bold text-navy mb-4">How verification works</h4>
        <ol className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 bg-navy text-gold rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</span>
             Submit your professional license details and document.
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 bg-navy text-gold rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</span>
             Our admin team reviews your submission.
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 bg-navy text-gold rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</span>
             Once approved, you are marked as a verified professional.
          </li>
        </ol>
      </div>
    </div>
  );
};

export default Verification;
