'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCw,
  Globe2,
  Building,
  Filter,
  Search,
  Sparkles,
  Layers,
  Send,
  AlertTriangle,
} from 'lucide-react';
import {
  MarketingDraftItem,
  fetchMarketingDrafts,
} from '@/lib/marketingApi';
import MarketingNav from '@/components/admin/marketing/MarketingNav';
import DraftCard from '@/components/admin/marketing/DraftCard';
import DraftApprovalModal from '@/components/admin/marketing/DraftApprovalModal';

const CAMPAIGN_TABS = [
  { id: 'ALL', label: 'All Campaigns', icon: Layers },
  { id: 'WEBSITE_MARKETING', label: 'Website Marketing', icon: Globe2 },
  { id: 'PROPERTY_MARKETING', label: 'Property Marketing', icon: Building },
];

const STATUS_TABS = [
  { id: 'PENDING_APPROVAL', label: 'Pending Approval', color: 'text-amber-700 bg-amber-50' },
  { id: 'APPROVED', label: 'Approved', color: 'text-emerald-700 bg-emerald-50' },
  { id: 'PUBLISHED', label: 'Published', color: 'text-purple-700 bg-purple-50' },
  { id: 'REJECTED', label: 'Rejected', color: 'text-red-700 bg-red-50' },
  { id: 'CANCELLED_PROPERTY_UNAVAILABLE', label: 'Cancelled (Unavailable)', color: 'text-rose-700 bg-rose-50' },
  { id: 'ALL', label: 'All Statuses', color: 'text-navy-700 bg-navy-50' },
];

export default function MarketingQueuePage() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('campaignType') || 'ALL';
  const initialStatus = searchParams.get('status') || 'PENDING_APPROVAL';

  const [campaignType, setCampaignType] = useState(initialType);
  const [status, setStatus] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');

  const [drafts, setDrafts] = useState<MarketingDraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected draft for approval modal
  const [selectedDraft, setSelectedDraft] = useState<MarketingDraftItem | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadDrafts = async () => {
    try {
      const params: any = { limit: 50 };
      if (campaignType !== 'ALL') params.campaignType = campaignType;
      if (status !== 'ALL') params.status = status;

      const res = await fetchMarketingDrafts(params);
      if (res.success && res.data) {
        setDrafts(res.data);
      } else {
        showToast(res.message || 'Failed to load marketing drafts.', 'error');
      }
    } catch {
      showToast('Network error loading queue.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, [campaignType, status]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDrafts();
  };

  // Client search filter
  const filteredDrafts = drafts.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.headline.toLowerCase().includes(q) ||
      d.groupName.toLowerCase().includes(q) ||
      d.targetArea.toLowerCase().includes(q) ||
      d.caption.toLowerCase().includes(q)
    );
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Unified Marketing Approval Queue
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Review, edit, regenerate, and approve promotional posts from both engines before manual Facebook publication.
          </p>
        </div>

        <button
          type="button"
          disabled={refreshing}
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 px-3.5 py-2.5 text-xs font-bold transition shadow-subtle disabled:opacity-50"
        >
          <RotateCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Sub Nav */}
      <MarketingNav />

      {/* Filters Card */}
      <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-5 space-y-4">
        {/* Campaign Type Tabs */}
        <div className="flex items-center gap-2 border-b border-navy-100 pb-3 overflow-x-auto">
          {CAMPAIGN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = campaignType === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setCampaignType(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  isSelected
                    ? 'bg-navy-950 text-white shadow-sm'
                    : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-brand-400' : 'text-navy-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Filter Tabs & Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_TABS.map((tab) => {
              const isSelected = status === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-navy-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search headline or group..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Draft Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-96 rounded-3xl bg-white border border-navy-100 p-6 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-5 w-24 bg-navy-100 rounded" />
                <div className="h-6 w-3/4 bg-navy-200 rounded" />
                <div className="h-20 bg-navy-100 rounded-xl" />
              </div>
              <div className="h-8 w-full bg-navy-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredDrafts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-16 text-center text-navy-400">
          <CheckSquare className="h-12 w-12 mx-auto text-navy-200 mb-3" />
          <h3 className="text-base font-extrabold text-navy-900">No Drafts In This Filter</h3>
          <p className="text-xs text-navy-500 mt-1 max-w-md mx-auto">
            {status === 'PENDING_APPROVAL'
              ? 'Great job! All current marketing campaigns have been moderated.'
              : `No marketing campaigns found with status: ${status}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrafts.map((draft) => (
            <DraftCard
              key={draft._id}
              draft={draft}
              onSelect={(d) => setSelectedDraft(d)}
              onRefresh={handleRefresh}
              showToast={showToast}
            />
          ))}
        </div>
      )}

      {/* Campaign Approval Modal */}
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
