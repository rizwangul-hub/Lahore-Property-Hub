'use client';

import React, { useState } from 'react';
import {
  Globe2,
  Building,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCw,
  Copy,
  ExternalLink,
  ChevronRight,
  Clock,
  Check,
  SkipForward,
} from 'lucide-react';
import {
  MarketingDraftItem,
  approveMarketingDraft,
  rejectMarketingDraft,
  skipMarketingDraft,
  regenerateMarketingDraft,
} from '@/lib/marketingApi';

interface DraftCardProps {
  draft: MarketingDraftItem;
  onSelect: (draft: MarketingDraftItem) => void;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function DraftCard({
  draft,
  onSelect,
  onRefresh,
  showToast,
}: DraftCardProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPending = draft.status === 'PENDING_APPROVAL';
  const isApproved = draft.status === 'APPROVED';

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const fullCopy = `${draft.headline}\n\n${draft.caption}\n\n${(draft.hashtags || []).join(' ')}`;
      await navigator.clipboard.writeText(fullCopy);
      setCopied(true);
      showToast('Caption copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setApproving(true);
    try {
      const res = await approveMarketingDraft(draft._id);
      if (res.success) {
        showToast('Campaign approved! Moved to Publishing Workspace.', 'success');
        onRefresh();
      } else {
        showToast(res.message || 'Approval rejected.', 'error');
      }
    } catch {
      showToast('Network error during approval.', 'error');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRejecting(true);
    try {
      const res = await rejectMarketingDraft(draft._id, 'Rejected by quick action');
      if (res.success) {
        showToast('Draft rejected.', 'success');
        onRefresh();
      } else {
        showToast(res.message || 'Failed to reject draft.', 'error');
      }
    } catch {
      showToast('Network error during rejection.', 'error');
    } finally {
      setRejecting(false);
    }
  };

  const handleSkip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSkipping(true);
    try {
      const res = await skipMarketingDraft(draft._id);
      if (res.success) {
        showToast('Draft skipped.', 'success');
        onRefresh();
      } else {
        showToast(res.message || 'Failed to skip draft.', 'error');
      }
    } catch {
      showToast('Network error skipping draft.', 'error');
    } finally {
      setSkipping(false);
    }
  };

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRegenerating(true);
    try {
      const res = await regenerateMarketingDraft(draft._id);
      if (res.success) {
        showToast('New copy variation generated!', 'success');
        onRefresh();
      } else {
        showToast(res.message || 'Failed to regenerate caption.', 'error');
      }
    } catch {
      showToast('Network error regenerating copy.', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(draft)}
      className="bg-white rounded-3xl border border-navy-100 shadow-subtle hover:shadow-hover transition duration-200 p-5 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${
                draft.campaignType === 'WEBSITE_MARKETING'
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {draft.campaignType === 'WEBSITE_MARKETING' ? (
                <Globe2 className="h-3 w-3" />
              ) : (
                <Building className="h-3 w-3" />
              )}
              <span>{draft.campaignType === 'WEBSITE_MARKETING' ? 'Website' : 'Property'}</span>
            </span>

            <span className="text-[11px] font-bold text-navy-400">•</span>
            <span className="text-[11px] font-semibold text-navy-600 truncate max-w-[140px]">
              {draft.targetArea}
            </span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              draft.status === 'PENDING_APPROVAL'
                ? 'bg-amber-100 text-amber-800'
                : draft.status === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-800'
                : draft.status === 'PUBLISHED'
                ? 'bg-purple-100 text-purple-800'
                : draft.status === 'CANCELLED_PROPERTY_UNAVAILABLE'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-navy-100 text-navy-700'
            }`}
          >
            {draft.status === 'CANCELLED_PROPERTY_UNAVAILABLE'
              ? 'Unavailable'
              : draft.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Group Name & Language */}
        <div className="mb-3">
          <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">
            Target Group
          </p>
          <h4 className="text-sm font-extrabold text-navy-950 line-clamp-1 group-hover:text-brand-600 transition">
            {draft.groupName}
          </h4>
        </div>

        {/* Headline & Caption Preview */}
        <div className="mb-4">
          <p className="text-xs font-bold text-navy-900 line-clamp-2 leading-snug">
            {draft.headline}
          </p>
          <p className="text-[11px] text-navy-500 line-clamp-3 mt-1.5 leading-relaxed font-sans">
            {draft.caption}
          </p>
        </div>

        {/* Media Thumbnail */}
        {draft.imageUrls && draft.imageUrls.length > 0 && (
          <div className="relative mb-4 rounded-2xl overflow-hidden aspect-video bg-navy-100 border border-navy-100">
            <img
              src={draft.imageUrls[0]}
              alt="Marketing Visual"
              className="w-full h-full object-cover"
            />
            {draft.imageUrls.length > 1 && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-navy-950/80 text-white text-[10px] font-bold">
                +{draft.imageUrls.length - 1} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Date & Destination */}
      <div className="border-t border-navy-100 pt-3 mt-2">
        <div className="flex items-center justify-between text-[11px] text-navy-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(draft.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="font-semibold text-brand-600">{draft.language}</span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(draft);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-800 text-xs font-bold transition"
          >
            <Eye className="h-3.5 w-3.5 text-navy-600" />
            <span>Review</span>
          </button>

          {isPending && (
            <>
              <button
                type="button"
                disabled={regenerating}
                title="Regenerate copy"
                onClick={handleRegenerate}
                className="p-2 rounded-xl border border-navy-200 hover:bg-navy-50 text-navy-700 transition"
              >
                <RotateCw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin text-brand-600' : ''}`} />
              </button>

              <button
                type="button"
                disabled={skipping}
                title="Skip draft"
                onClick={handleSkip}
                className="p-2 rounded-xl border border-navy-200 hover:bg-navy-50 text-navy-500 hover:text-navy-800 transition"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={rejecting}
                title="Reject draft"
                onClick={handleReject}
                className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={approving}
                onClick={handleApprove}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve</span>
              </button>
            </>
          )}

          {isApproved && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-navy-950 text-brand-400 text-xs font-bold hover:bg-navy-900 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
