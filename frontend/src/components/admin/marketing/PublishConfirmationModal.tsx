'use client';

import React, { useState } from 'react';
import {
  X,
  Facebook,
  CheckCircle2,
  Copy,
  ExternalLink,
  Download,
  Check,
  AlertCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  MarketingDraftItem,
  confirmDraftPublished,
} from '@/lib/marketingApi';

interface PublishConfirmationModalProps {
  draft: MarketingDraftItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function PublishConfirmationModal({
  draft,
  isOpen,
  onClose,
  onSuccess,
  showToast,
}: PublishConfirmationModalProps) {
  if (!isOpen || !draft) return null;

  const [facebookPostUrl, setFacebookPostUrl] = useState('');
  const [confirmedManualPost, setConfirmedManualPost] = useState(true);
  const [publicationDate, setPublicationDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyCaption = async () => {
    try {
      const fullCopy = `${draft.headline}\n\n${draft.caption}\n\n${(draft.hashtags || []).join(' ')}`;
      await navigator.clipboard.writeText(fullCopy);
      setCopiedCaption(true);
      showToast('Caption copied to clipboard!', 'success');
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      showToast('Clipboard error', 'error');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(draft.targetUrl);
      setCopiedUrl(true);
      showToast('Destination link copied!', 'success');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      showToast('Clipboard error', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setSubmitting(true);
    try {
      const res = await confirmDraftPublished(draft._id, {
        facebookPostUrl: facebookPostUrl.trim() || undefined,
        notes: notes.trim(),
        publicationDate: new Date(publicationDate).toISOString(),
      });

      if (res.success) {
        onSuccess(
          `Publication confirmed for "${draft.groupName}". Cooldown timer has been activated.`
        );
        onClose();
      } else {
        setError(res.message || 'Server rejected publication confirmation.');
      }
    } catch {
      setError('Network communication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-navy-100 overflow-hidden my-8 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy-100 bg-navy-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-950 text-brand-400">
              <Facebook className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy-950">
                Manual Facebook Publishing Workspace
              </h3>
              <p className="text-xs text-navy-500">
                Publish manually to {draft.groupName} and confirm publication record
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-navy-400 hover:text-navy-700 hover:bg-navy-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Workflow Guide Notice */}
          <div className="p-4 rounded-2xl bg-navy-50 border border-navy-100 space-y-3">
            <span className="text-xs font-extrabold text-navy-950 uppercase tracking-wider block">
              Step-by-Step Publishing Actions
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleCopyCaption}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-navy-200 hover:border-brand-500 text-navy-800 text-xs font-bold transition shadow-subtle text-center gap-1.5"
              >
                {copiedCaption ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-brand-600" />}
                <span className="text-[11px]">{copiedCaption ? 'Copied!' : '1. Copy Caption'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-navy-200 hover:border-brand-500 text-navy-800 text-xs font-bold transition shadow-subtle text-center gap-1.5"
              >
                {copiedUrl ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-blue-600" />}
                <span className="text-[11px]">{copiedUrl ? 'Copied!' : '2. Copy Link'}</span>
              </button>

              {draft.imageUrls && draft.imageUrls[0] ? (
                <a
                  href={draft.imageUrls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-navy-200 hover:border-brand-500 text-navy-800 text-xs font-bold transition shadow-subtle text-center gap-1.5"
                >
                  <Download className="h-4 w-4 text-teal-600" />
                  <span className="text-[11px]">3. Open Image</span>
                </a>
              ) : (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 text-[11px] text-center">
                  No Image
                </div>
              )}

              <a
                href={draft.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-navy-950 text-brand-400 hover:bg-navy-900 text-xs font-bold transition shadow-subtle text-center gap-1.5"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-[11px]">4. Open Group</span>
              </a>
            </div>
          </div>

          {/* Facebook Post URL Input (Optional) */}
          <div>
            <label className="block text-xs font-bold text-navy-800 mb-1">
              Confirmed Facebook Post URL <span className="text-navy-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={facebookPostUrl}
              onChange={(e) => setFacebookPostUrl(e.target.value)}
              placeholder="Optional: https://facebook.com/groups/... (leave empty for 1-click confirm)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
            <span className="text-[11px] text-navy-400 mt-1 block">
              Optional: Leave empty to instantly record publication and activate group cooldown.
            </span>
          </div>

          {/* Publication Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Publication Date & Time
              </label>
              <input
                type="datetime-local"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Internal Audit Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes or admin remarks"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>
          </div>

          {/* Confirmation Checkbox (MANDATORY REQUIREMENT) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={confirmedManualPost}
                onChange={(e) => setConfirmedManualPost(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-amber-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-xs font-extrabold text-navy-950 block">
                  I confirm manual publication in Facebook
                </span>
                <span className="text-[11px] text-navy-600 leading-relaxed block mt-0.5">
                  I have personally posted this approved content into the Facebook group. Confirming
                  will record the audit log and activate the {draft.campaignType === 'WEBSITE_MARKETING' ? 'Website Marketing' : 'Property Marketing'} cooldown timer.
                </span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-navy-200 text-navy-700 font-bold text-xs hover:bg-navy-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !confirmedManualPost}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Confirming...' : 'Confirm Publication & Activate Cooldown'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
