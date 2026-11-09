'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Download,
  Edit3,
  RotateCw,
  Facebook,
  Globe2,
  Building,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  Check,
  Eye,
} from 'lucide-react';
import {
  MarketingDraftItem,
  approveMarketingDraft,
  rejectMarketingDraft,
  skipMarketingDraft,
  updateMarketingDraft,
  regenerateMarketingDraft,
} from '@/lib/marketingApi';

interface DraftApprovalModalProps {
  draft: MarketingDraftItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function DraftApprovalModal({
  draft,
  isOpen,
  onClose,
  onSuccess,
  showToast,
}: DraftApprovalModalProps) {
  if (!isOpen || !draft) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [headline, setHeadline] = useState(draft.headline);
  const [caption, setCaption] = useState(draft.caption);
  const [hashtagsStr, setHashtagsStr] = useState((draft.hashtags || []).join(' '));
  const [savingEdit, setSavingEdit] = useState(false);

  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [rejectReasonPrompt, setRejectReasonPrompt] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isPending = draft.status === 'PENDING_APPROVAL';
  const isApproved = draft.status === 'APPROVED';
  const isPropertyUnavailable = Boolean(
    draft.status === 'CANCELLED_PROPERTY_UNAVAILABLE' ||
    (draft.livePropertyStatus && draft.livePropertyStatus !== 'APPROVED')
  );

  const handleCopyCaption = async () => {
    try {
      const fullCopy = `${draft.headline}\n\n${draft.caption}\n\n${(draft.hashtags || []).join(' ')}`;
      await navigator.clipboard.writeText(fullCopy);
      setCopiedCaption(true);
      showToast('Caption and hashtags copied to clipboard!', 'success');
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {
      showToast('Could not access clipboard.', 'error');
    }
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const tags = hashtagsStr
        .split(/\s+/)
        .map((t) => (t.startsWith('#') ? t : `#${t}`))
        .filter((t) => t.length > 1);

      const res = await updateMarketingDraft(draft._id, {
        headline: headline.trim(),
        caption: caption.trim(),
        hashtags: tags,
      });

      if (res.success && res.data) {
        showToast('Draft caption updated successfully!', 'success');
        draft.headline = res.data.headline;
        draft.caption = res.data.caption;
        draft.hashtags = res.data.hashtags;
        setIsEditing(false);
      } else {
        showToast(res.message || 'Failed to update draft.', 'error');
      }
    } catch {
      showToast('Network error updating draft.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await regenerateMarketingDraft(draft._id);
      if (res.success && res.data) {
        setHeadline(res.data.headline);
        setCaption(res.data.caption);
        setHashtagsStr((res.data.hashtags || []).join(' '));
        draft.headline = res.data.headline;
        draft.caption = res.data.caption;
        draft.hashtags = res.data.hashtags;
        showToast('New copy variation generated successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to regenerate caption.', 'error');
      }
    } catch {
      showToast('Network error regenerating copy.', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleApprove = async () => {
    if (isPropertyUnavailable) {
      showToast('Cannot approve: Property is no longer available.', 'error');
      return;
    }
    setApproving(true);
    try {
      const res = await approveMarketingDraft(draft._id);
      if (res.success) {
        onSuccess('Campaign approved! Moved to Manual Publishing Workspace.');
        onClose();
      } else {
        showToast(res.message || 'Approval rejected by server.', 'error');
      }
    } catch {
      showToast('Network error approving campaign.', 'error');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      const res = await rejectMarketingDraft(draft._id, rejectReason || 'Rejected by administrator');
      if (res.success) {
        onSuccess('Campaign draft rejected.');
        onClose();
      } else {
        showToast(res.message || 'Failed to reject draft.', 'error');
      }
    } catch {
      showToast('Network error rejecting campaign.', 'error');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-navy-100 overflow-hidden my-8 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy-100 bg-navy-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                draft.campaignType === 'WEBSITE_MARKETING'
                  ? 'bg-brand-50 text-brand-600 border border-brand-200'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}
            >
              {draft.campaignType === 'WEBSITE_MARKETING' ? (
                <Globe2 className="h-6 w-6" />
              ) : (
                <Building className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    draft.campaignType === 'WEBSITE_MARKETING'
                      ? 'bg-brand-100 text-brand-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {draft.campaignType === 'WEBSITE_MARKETING' ? 'Website Marketing' : 'Property Marketing'}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    draft.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-100 text-amber-800'
                      : draft.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : draft.status === 'PUBLISHED'
                      ? 'bg-purple-100 text-purple-800'
                      : draft.status === 'CANCELLED_PROPERTY_UNAVAILABLE'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-navy-100 text-navy-800'
                  }`}
                >
                  {draft.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-navy-950 mt-1">
                Campaign Review & Moderation
              </h3>
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

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Target Group & Area Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-navy-50/70 border border-navy-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
                Target Facebook Group
              </span>
              <p className="font-extrabold text-navy-900 mt-0.5">{draft.groupName}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
                Target Society / Area
              </span>
              <p className="font-bold text-navy-800 mt-0.5">{draft.targetArea}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
                Campaign Language
              </span>
              <p className="font-bold text-navy-800 mt-0.5">{draft.language}</p>
            </div>
          </div>

          {/* Property status alert if unavailable */}
          {isPropertyUnavailable && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-extrabold">Property is No Longer Available</p>
                <p className="text-[11px] mt-0.5">
                  The linked property has been sold, rented, rejected, or deleted. In accordance with
                  strict marketplace integrity rules, this campaign cannot be approved or published.
                </p>
              </div>
            </div>
          )}

          {/* Copy and Caption Area */}
          <div className="p-5 rounded-2xl bg-white border border-navy-200 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-navy-950 uppercase tracking-wider">
                Marketing Copy
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={regenerating || !isPending}
                  onClick={handleRegenerate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 text-xs font-bold transition disabled:opacity-40"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin text-brand-600' : ''}`} />
                  <span>Regenerate Copy</span>
                </button>

                {!isEditing ? (
                  <button
                    type="button"
                    disabled={!isPending && !isApproved}
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 text-xs font-bold transition disabled:opacity-40"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-navy-600" />
                    <span>Edit Caption</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={handleSaveEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-950 text-brand-400 text-xs font-bold hover:bg-navy-900 transition"
                >
                  {copiedCaption ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCaption ? 'Copied!' : 'Copy Full Copy'}</span>
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-navy-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-navy-700 mb-1">Full Caption Body</label>
                  <textarea
                    rows={8}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-navy-700 mb-1">Hashtags</label>
                  <input
                    type="text"
                    value={hashtagsStr}
                    onChange={(e) => setHashtagsStr(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-700"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-navy-50 font-bold text-navy-900 text-sm">
                  {draft.headline}
                </div>

                <div className="p-4 rounded-xl bg-navy-50/50 border border-navy-100 text-navy-800 text-xs whitespace-pre-line leading-relaxed font-sans">
                  {draft.caption}
                </div>

                {draft.hashtags && draft.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {draft.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[11px] font-semibold border border-brand-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media Images Preview */}
          {draft.imageUrls && draft.imageUrls.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-navy-950 uppercase tracking-wider block">
                Attached Marketing Media ({draft.imageUrls.length} Images)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {draft.imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-2xl overflow-hidden border border-navy-100 aspect-video bg-navy-100 shadow-subtle"
                  >
                    <img
                      src={url}
                      alt={`Marketing visual ${idx + 1}`}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 text-white text-[11px] font-bold"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Open Image</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destination URL & UTM */}
          <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 flex items-center justify-between">
            <div className="truncate pr-4">
              <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
                Destination Link (with UTM Tracking)
              </span>
              <span className="text-xs text-brand-700 font-mono truncate block">
                {draft.targetUrl}
              </span>
            </div>

            <a
              href={draft.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-navy-200 bg-white text-navy-700 hover:bg-navy-100 text-xs font-bold transition shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Verify Link</span>
            </a>
          </div>

          {/* Rejection reason prompt */}
          {rejectReasonPrompt && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-scale-up">
              <span className="text-xs font-bold text-rose-900 block">
                Rejection Reason (Internal Record)
              </span>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Group rules prohibit this format, or duplicate society focus"
                className="w-full px-3.5 py-2 rounded-xl border border-rose-300 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectReasonPrompt(false)}
                  className="px-3 py-1.5 text-xs text-navy-600 font-bold hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={rejecting}
                  onClick={handleReject}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-navy-100 bg-navy-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-navy-200 text-navy-700 font-bold text-xs hover:bg-navy-100 transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {isPending && !rejectReasonPrompt && (
              <>
                <button
                  type="button"
                  onClick={() => setRejectReasonPrompt(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50 transition"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  disabled={approving || isPropertyUnavailable}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{approving ? 'Approving...' : 'Approve Campaign'}</span>
                </button>
              </>
            )}

            {isApproved && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Approved — Ready in Publishing Workspace</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
