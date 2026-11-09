'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe2,
  Building,
  Play,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  MarketingStatsData,
  triggerWebsiteCampaignRun,
  triggerPropertyCampaignRun,
} from '@/lib/marketingApi';

interface EnginePanelsProps {
  stats: MarketingStatsData | null;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function EnginePanels({ stats, onRefresh, showToast }: EnginePanelsProps) {
  const [runningEngine1, setRunningEngine1] = useState(false);
  const [runningEngine2, setRunningEngine2] = useState(false);

  const handleRunEngine1 = async () => {
    setRunningEngine1(true);
    try {
      const res = await triggerWebsiteCampaignRun();
      if (res.success) {
        showToast(res.message || 'Engine 1 generated daily promotional campaigns!', 'success');
        onRefresh();
      } else {
        showToast(res.message || 'Failed to run Engine 1 campaign generator.', 'error');
      }
    } catch {
      showToast('Network error triggering Engine 1.', 'error');
    } finally {
      setRunningEngine1(false);
    }
  };

  const handleRunEngine2 = async () => {
    setRunningEngine2(true);
    try {
      const res = await triggerPropertyCampaignRun();
      if (res.success) {
        showToast(res.message || 'Engine 2 processed new approved properties!', 'success');
        onRefresh();
      } else {
        showToast(res.message || 'Failed to run Engine 2 processor.', 'error');
      }
    } catch {
      showToast('Network error triggering Engine 2.', 'error');
    } finally {
      setRunningEngine2(false);
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never executed';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* ENGINE 1: DAILY WEBSITE MARKETING */}
      <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle hover:shadow-card transition overflow-hidden flex flex-col">
        <div className="p-6 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                <Globe2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400">
                  Engine 1
                </span>
                <h3 className="text-lg font-extrabold text-white">Daily Website Marketing</h3>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
              <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
              Active
            </span>
          </div>

          <p className="text-xs text-navy-300 mt-3 leading-relaxed">
            Generates daily brand promotional posts highlighting{' '}
            <span className="text-brand-300 font-semibold">propertyinlahore.online</span> across
            eligible Facebook Groups to attract property sellers, landlords, and dealers.
          </p>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-navy-50/70 border border-navy-100">
              <p className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">
                Today's Drafts
              </p>
              <p className="text-xl font-extrabold text-navy-950 mt-1">
                {stats?.engine1.todayGenerated ?? 0}
              </p>
              <p className="text-[10px] text-navy-400 mt-0.5">Ready in approval queue</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-navy-50/70 border border-navy-100">
              <p className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">
                Eligible Groups
              </p>
              <p className="text-xl font-extrabold text-navy-950 mt-1">
                {stats?.engine1.eligibleGroups ?? 0}
              </p>
              <p className="text-[10px] text-navy-400 mt-0.5">Allows website marketing</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-navy-600 border-t border-navy-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-navy-500">
                <Clock className="h-3.5 w-3.5 text-navy-400" />
                Next Scheduled Generation:
              </span>
              <span className="font-bold text-navy-900">Daily at 10:00 AM PKT</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-navy-500">
                <RotateCw className="h-3.5 w-3.5 text-navy-400" />
                Last Generation:
              </span>
              <span className="font-semibold text-navy-800">
                {formatDate(stats?.engine1.lastRunAt)}
              </span>
            </div>

            {stats?.engine1.lastTheme && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-navy-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                  Active Rotating Theme:
                </span>
                <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[11px]">
                  {stats.engine1.lastTheme.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={runningEngine1}
              onClick={handleRunEngine1}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-3 transition shadow-sm disabled:opacity-50"
            >
              {runningEngine1 ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Generating Campaigns...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Generate Campaign Now</span>
                </>
              )}
            </button>

            <Link
              href="/admin/marketing/queue?campaignType=WEBSITE_MARKETING"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 font-bold text-xs px-4 py-3 transition"
            >
              <span>View Drafts</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ENGINE 2: NEW PROPERTY MARKETING */}
      <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle hover:shadow-card transition overflow-hidden flex flex-col">
        <div className="p-6 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
                  Engine 2
                </span>
                <h3 className="text-lg font-extrabold text-white">New Property Marketing</h3>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              Event-Driven
            </span>
          </div>

          <p className="text-xs text-navy-300 mt-3 leading-relaxed">
            Automatically triggers when an administrator approves a property. Extracts authentic
            Cloudinary images, verified price, and society to match location-specific groups.
          </p>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-navy-50/70 border border-navy-100">
              <p className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">
                Approved Properties
              </p>
              <p className="text-xl font-extrabold text-navy-950 mt-1">
                {stats?.engine2.approvedPropertiesDetected ?? 0}
              </p>
              <p className="text-[10px] text-navy-400 mt-0.5">Live on marketplace</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-navy-50/70 border border-navy-100">
              <p className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">
                Matching Groups
              </p>
              <p className="text-xl font-extrabold text-navy-950 mt-1">
                {stats?.engine2.matchingGroups ?? 0}
              </p>
              <p className="text-[10px] text-navy-400 mt-0.5">Allows property advertising</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-navy-600 border-t border-navy-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-navy-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Generated Property Drafts:
              </span>
              <span className="font-bold text-navy-900">
                {stats?.engine2.generatedDrafts ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-navy-500">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                Pending Moderation:
              </span>
              <span className="font-bold text-amber-700">
                {stats?.engine2.pendingApprovals ?? 0} awaiting
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-navy-500">
                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                Cancelled (Unavailable):
              </span>
              <span className="font-semibold text-rose-700">
                {stats?.engine2.cancelledDrafts ?? 0} auto-cancelled
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={runningEngine2}
              onClick={handleRunEngine2}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs px-4 py-3 transition shadow-sm disabled:opacity-50"
            >
              {runningEngine2 ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Processing Properties...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-brand-400" />
                  <span>Process New Properties</span>
                </>
              )}
            </button>

            <Link
              href="/admin/marketing/queue?campaignType=PROPERTY_MARKETING"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 font-bold text-xs px-4 py-3 transition"
            >
              <span>View Drafts</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
