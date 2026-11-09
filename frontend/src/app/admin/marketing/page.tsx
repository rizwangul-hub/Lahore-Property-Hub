'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  RotateCw,
  Sparkles,
  Megaphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building,
  Globe2,
} from 'lucide-react';
import {
  MarketingStatsData,
  fetchMarketingStats,
  MarketingDraftItem,
  fetchMarketingDrafts,
  PostingHistoryItem,
  fetchPostingHistory,
} from '@/lib/marketingApi';
import MarketingNav from '@/components/admin/marketing/MarketingNav';
import MarketingStatCards from '@/components/admin/marketing/MarketingStatCards';
import EnginePanels from '@/components/admin/marketing/EnginePanels';
import DraftApprovalModal from '@/components/admin/marketing/DraftApprovalModal';

export default function MarketingDashboardPage() {
  const [stats, setStats] = useState<MarketingStatsData | null>(null);
  const [recentDrafts, setRecentDrafts] = useState<MarketingDraftItem[]>([]);
  const [recentHistory, setRecentHistory] = useState<PostingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected draft for approval modal
  const [selectedDraft, setSelectedDraft] = useState<MarketingDraftItem | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadDashboardData = async () => {
    try {
      const [statsRes, draftsRes, historyRes] = await Promise.all([
        fetchMarketingStats(),
        fetchMarketingDrafts({ limit: 6 }),
        fetchPostingHistory({ limit: 5 }),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (draftsRes.success && draftsRes.data) {
        setRecentDrafts(draftsRes.data);
      }
      if (historyRes.success && historyRes.data) {
        setRecentHistory(historyRes.data);
      }
    } catch {
      showToast('Error loading marketing dashboard data.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white border ${
              toast.type === 'error'
                ? 'bg-red-600 border-red-500'
                : 'bg-navy-950 border-brand-500/50'
            }`}
          >
            {toast.type === 'error' ? (
              <span className="h-2 w-2 rounded-full bg-red-400" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="Property in Lahore"
              width={2400}
              height={1792}
              sizes="64px"
              className="h-auto w-16 rounded"
            />
            <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-extrabold uppercase tracking-wider">
              AI Marketing Assistant
            </span>
            <span className="text-navy-400 text-xs">•</span>
            <span className="text-xs font-semibold text-navy-500">
              propertyinlahore.online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight mt-1">
            Marketing AI Command Center
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Dual-engine Facebook marketing: Daily website brand campaigns & new approved property advertisements.
          </p>
        </div>

        <button
          type="button"
          disabled={refreshing}
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 px-4 py-2.5 text-xs font-bold transition shadow-subtle disabled:opacity-50"
        >
          <RotateCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Refresh Hub'}</span>
        </button>
      </div>

      {/* Sub-Navigation */}
      <MarketingNav
        pendingCount={stats?.pendingApprovals ?? 0}
        approvedCount={stats?.approvedDrafts ?? 0}
      />

      {/* 9 KPI Cards */}
      <MarketingStatCards stats={stats} loading={loading} />

      {/* Two Campaign Panels (Engine 1 & Engine 2) */}
      <EnginePanels stats={stats} onRefresh={handleRefresh} showToast={showToast} />

      {/* Recent Approvals & Publishing History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Marketing Drafts (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-navy-100 shadow-subtle p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider">
                  Recent Marketing Drafts
                </h3>
              </div>
              <Link
                href="/admin/marketing/queue"
                className="text-xs font-bold text-brand-600 hover:text-brand-800 inline-flex items-center gap-1 transition"
              >
                <span>View All Queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-2xl bg-navy-50 animate-pulse" />
                ))}
              </div>
            ) : recentDrafts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-navy-200 text-navy-400 text-xs">
                No marketing drafts generated yet. Click "Generate Campaign" above to run Engine 1.
              </div>
            ) : (
              <div className="divide-y divide-navy-100">
                {recentDrafts.map((draft) => (
                  <div
                    key={draft._id}
                    onClick={() => setSelectedDraft(draft)}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-navy-50/50 rounded-xl px-2 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                          draft.campaignType === 'WEBSITE_MARKETING'
                            ? 'bg-brand-50 text-brand-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {draft.campaignType === 'WEBSITE_MARKETING' ? (
                          <Globe2 className="h-4 w-4" />
                        ) : (
                          <Building className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-navy-900 truncate">
                          {draft.headline}
                        </p>
                        <p className="text-[11px] text-navy-500 truncate mt-0.5">
                          {draft.groupName} • {draft.targetArea} ({draft.language})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          draft.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-800'
                            : draft.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : draft.status === 'PUBLISHED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-navy-100 text-navy-700'
                        }`}
                      >
                        {draft.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-navy-100 flex items-center justify-between text-xs text-navy-500">
            <span>Mandatory Approval: Every campaign requires admin approval before posting.</span>
            <Link
              href="/admin/marketing/queue"
              className="font-bold text-navy-800 hover:text-brand-600"
            >
              Open Queue →
            </Link>
          </div>
        </div>

        {/* Confirmed Publications Audit Log (1 col) */}
        <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider">
                  Confirmed Publications
                </h3>
              </div>
              <Link
                href="/admin/marketing/publishing"
                className="text-xs font-bold text-brand-600 hover:text-brand-800"
              >
                Workspace
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-navy-50 animate-pulse" />
                ))}
              </div>
            ) : recentHistory.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-navy-200 text-navy-400 text-xs">
                No manual publications recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentHistory.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 rounded-2xl bg-navy-50/70 border border-navy-100 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy-900 truncate pr-2">
                        {item.groupName}
                      </span>
                      <span className="text-[10px] text-navy-400 shrink-0">
                        {new Date(item.postedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-navy-100/60">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        CONFIRMED
                      </span>
                      {item.facebookPostUrl && (
                        <a
                          href={item.facebookPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-brand-600 hover:text-brand-800 inline-flex items-center gap-1"
                        >
                          <span>View on FB</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-navy-100 text-[11px] text-navy-400">
            Publishing confirmations automatically update group cooldown timestamps.
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <DraftApprovalModal
        draft={selectedDraft}
        isOpen={Boolean(selectedDraft)}
        onClose={() => setSelectedDraft(null)}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          handleRefresh();
        }}
        showToast={showToast}
      />
    </div>
  );
}
