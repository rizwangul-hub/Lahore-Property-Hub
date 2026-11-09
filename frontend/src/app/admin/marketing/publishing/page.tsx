'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Copy,
  ExternalLink,
  Download,
  RotateCw,
  Facebook,
  Globe2,
  Building,
  Clock,
  Check,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import {
  MarketingDraftItem,
  fetchMarketingDrafts,
  PostingHistoryItem,
  fetchPostingHistory,
} from '@/lib/marketingApi';
import MarketingNav from '@/components/admin/marketing/MarketingNav';
import PublishConfirmationModal from '@/components/admin/marketing/PublishConfirmationModal';

export default function PublishingWorkspacePage() {
  const [approvedDrafts, setApprovedDrafts] = useState<MarketingDraftItem[]>([]);
  const [history, setHistory] = useState<PostingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [campaignFilter, setCampaignFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation modal
  const [activeDraftToPublish, setActiveDraftToPublish] = useState<MarketingDraftItem | null>(null);

  // Copy indicator map
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      const [draftsRes, historyRes] = await Promise.all([
        fetchMarketingDrafts({ status: 'APPROVED', limit: 50 }),
        fetchPostingHistory({ limit: 15 }),
      ]);

      if (draftsRes.success && draftsRes.data) {
        setApprovedDrafts(draftsRes.data);
      }
      if (historyRes.success && historyRes.data) {
        setHistory(historyRes.data);
      }
    } catch {
      showToast('Error loading publishing workspace.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCopyCaption = async (draft: MarketingDraftItem) => {
    try {
      const fullCopy = `${draft.headline}\n\n${draft.caption}\n\n${(draft.hashtags || []).join(' ')}`;
      await navigator.clipboard.writeText(fullCopy);
      setCopiedMap((prev) => ({ ...prev, [draft._id]: true }));
      showToast('Caption copied! Ready to paste into Facebook.', 'success');
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [draft._id]: false }));
      }, 2000);
    } catch {
      showToast('Clipboard error', 'error');
    }
  };

  const filteredDrafts = approvedDrafts.filter((d) => {
    if (campaignFilter !== 'ALL' && d.campaignType !== campaignFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.headline.toLowerCase().includes(q) ||
        d.groupName.toLowerCase().includes(q) ||
        d.targetArea.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white border ${
              toast.type === 'error'
                ? 'bg-red-600 border-red-500'
                : 'bg-navy-950 border-brand-500/50'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Manual Facebook Publishing Workspace
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Publish approved campaigns manually into your Facebook Groups, then paste the post URL to confirm and update cooldowns.
          </p>
        </div>

        <button
          type="button"
          disabled={refreshing}
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 px-3.5 py-2.5 text-xs font-bold transition shadow-subtle disabled:opacity-50"
        >
          <RotateCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
          <span>Sync Workspace</span>
        </button>
      </div>

      {/* Sub Nav */}
      <MarketingNav approvedCount={approvedDrafts.length} />

      {/* Workflow Explainer Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white shadow-subtle">
        <div className="flex items-center gap-2 text-brand-400 text-xs font-extrabold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Manual Publishing Protocol</span>
        </div>
        <p className="text-xs text-navy-200 leading-relaxed max-w-3xl">
          Follow the 5-step manual flow for each approved card: (1) Copy Caption & Hashtags, (2) Copy
          destination link, (3) Download/Open media image, (4) Open Facebook Group in a new tab and create
          the post, and (5) Click <span className="text-white font-bold">Confirm Publication</span> to
          record the post URL and activate the group cooldown.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['ALL', 'WEBSITE_MARKETING', 'PROPERTY_MARKETING'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCampaignFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                campaignFilter === type
                  ? 'bg-navy-950 text-white shadow-sm'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
              }`}
            >
              {type === 'ALL'
                ? 'All Approved'
                : type === 'WEBSITE_MARKETING'
                ? 'Website Marketing'
                : 'Property Ads'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-navy-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search approved posts..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>
      </div>

      {/* Approved Drafts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-white border border-navy-100 p-6 animate-pulse" />
          ))}
        </div>
      ) : filteredDrafts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-16 text-center text-navy-400">
          <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
          <h3 className="text-base font-extrabold text-navy-900">No Approved Posts Awaiting Publication</h3>
          <p className="text-xs text-navy-500 mt-1 max-w-md mx-auto">
            Head to the <span className="font-semibold text-brand-600">Approval Queue</span> to approve pending drafts, or generate a new batch from the Command Center.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDrafts.map((draft) => (
            <div
              key={draft._id}
              className="bg-white rounded-3xl border border-navy-200 shadow-subtle hover:shadow-card transition duration-200 p-6 flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-3">
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
                      <span>{draft.campaignType === 'WEBSITE_MARKETING' ? 'Website Promo' : 'Property Ad'}</span>
                    </span>

                    <span className="text-xs font-bold text-navy-600">{draft.targetArea}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    APPROVED
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-navy-950 mb-1">
                  {draft.groupName}
                </h3>
                <p className="text-xs font-bold text-navy-800 leading-snug line-clamp-2">
                  {draft.headline}
                </p>

                <p className="text-[11px] text-navy-600 line-clamp-3 mt-2 font-sans whitespace-pre-line leading-relaxed bg-navy-50/70 p-3 rounded-xl border border-navy-100">
                  {draft.caption}
                </p>

                {draft.imageUrls && draft.imageUrls[0] && (
                  <div className="mt-3 relative rounded-xl overflow-hidden aspect-video bg-navy-100 border border-navy-100">
                    <img
                      src={draft.imageUrls[0]}
                      alt="Campaign Banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="border-t border-navy-100 pt-4 mt-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCaption(draft)}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-800 text-xs font-bold transition"
                  >
                    {copiedMap[draft._id] ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-navy-600" />
                    )}
                    <span>{copiedMap[draft._id] ? 'Copied' : '1. Copy'}</span>
                  </button>

                  {draft.imageUrls && draft.imageUrls[0] ? (
                    <a
                      href={draft.imageUrls[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-800 text-xs font-bold transition text-center"
                    >
                      <Download className="h-3.5 w-3.5 text-navy-600" />
                      <span>2. Image</span>
                    </a>
                  ) : (
                    <div className="flex items-center justify-center text-[10px] text-gray-400">
                      No Media
                    </div>
                  )}

                  <a
                    href={draft.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-brand-400 text-xs font-bold transition text-center"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>3. Group</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveDraftToPublish(draft)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 transition shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>4. Confirm Facebook Publication</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmed Publications Audit History */}
      <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-6">
        <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider mb-4">
          Manual Publication Audit History ({history.length} Confirmed Posts)
        </h3>

        {history.length === 0 ? (
          <div className="p-8 text-center text-navy-400 text-xs border border-dashed border-navy-200 rounded-2xl">
            No confirmed publications recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-100 text-[10px] font-extrabold uppercase text-navy-400">
                  <th className="pb-3">Facebook Group</th>
                  <th className="pb-3">Campaign Type</th>
                  <th className="pb-3">Published Time</th>
                  <th className="pb-3">Verified Link</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {history.map((h) => (
                  <tr key={h._id} className="py-2.5">
                    <td className="py-2.5 font-bold text-navy-900 truncate max-w-[200px]">
                      {h.groupName}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          h.campaignType === 'WEBSITE_MARKETING'
                            ? 'bg-brand-50 text-brand-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {h.campaignType === 'WEBSITE_MARKETING' ? 'Website Promo' : 'Property Ad'}
                      </span>
                    </td>
                    <td className="py-2.5 text-navy-500">
                      {new Date(h.postedAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5">
                      {h.facebookPostUrl ? (
                        <a
                          href={h.facebookPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-brand-600 hover:text-brand-800 inline-flex items-center gap-1"
                        >
                          <span>Open Post</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-navy-400">None</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        CONFIRMED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <PublishConfirmationModal
        draft={activeDraftToPublish}
        isOpen={Boolean(activeDraftToPublish)}
        onClose={() => setActiveDraftToPublish(null)}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          loadData();
        }}
        showToast={showToast}
      />
    </div>
  );
}
