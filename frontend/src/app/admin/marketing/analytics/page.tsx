'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Globe2,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  Send,
  AlertTriangle,
  MapPin,
  Languages,
  Tag,
  TrendingUp,
} from 'lucide-react';
import {
  MarketingAnalyticsData,
  fetchMarketingAnalytics,
} from '@/lib/marketingApi';
import MarketingNav from '@/components/admin/marketing/MarketingNav';

export default function MarketingAnalyticsPage() {
  const [analytics, setAnalytics] = useState<MarketingAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    try {
      const res = await fetchMarketingAnalytics();
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Marketing Campaign Analytics & Reporting
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Real-time performance metrics: publication volumes, area distribution, UTM tracking & moderation outcomes.
          </p>
        </div>

        <button
          type="button"
          disabled={refreshing}
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 px-3.5 py-2.5 text-xs font-bold transition shadow-subtle disabled:opacity-50"
        >
          <RotateCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Sub Nav */}
      <MarketingNav />

      {/* KPI Overview Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-navy-100 p-5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-navy-100 p-5 shadow-subtle">
            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
              Total Drafts Generated
            </span>
            <p className="text-2xl font-extrabold text-navy-950 mt-1">
              {analytics?.overview.totalDrafts ?? 0}
            </p>
            <span className="text-[11px] text-navy-500 mt-0.5 block">
              Pending: <span className="font-bold text-amber-600">{analytics?.overview.totalPending ?? 0}</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-navy-100 p-5 shadow-subtle">
            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
              Confirmed Publications
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {analytics?.publications.total ?? 0}
            </p>
            <span className="text-[11px] text-navy-500 mt-0.5 block">
              Confirmed manual Facebook posts
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-navy-100 p-5 shadow-subtle">
            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
              Approved For Posting
            </span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              {analytics?.overview.totalApproved ?? 0}
            </p>
            <span className="text-[11px] text-navy-500 mt-0.5 block">
              Ready in Publishing Workspace
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-navy-100 p-5 shadow-subtle">
            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
              Integrity Auto-Cancelled
            </span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">
              {analytics?.overview.totalCancelled ?? 0}
            </p>
            <span className="text-[11px] text-navy-500 mt-0.5 block">
              Sold/rented listings cleared
            </span>
          </div>
        </div>
      )}

      {/* Publications Breakdown: Engine 1 vs Engine 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider">
              Publications by Campaign Engine
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-navy-800 flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-brand-600" />
                  Engine 1: Daily Website Marketing
                </span>
                <span className="font-extrabold text-navy-950">
                  {analytics?.publications.websiteMarketing ?? 0} posts
                </span>
              </div>
              <div className="h-3 w-full bg-navy-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      analytics?.publications.total
                        ? Math.round(
                            ((analytics?.publications.websiteMarketing || 0) /
                              analytics.publications.total) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-navy-800 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-blue-600" />
                  Engine 2: New Property Marketing
                </span>
                <span className="font-extrabold text-navy-950">
                  {analytics?.publications.propertyMarketing ?? 0} posts
                </span>
              </div>
              <div className="h-3 w-full bg-navy-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      analytics?.publications.total
                        ? Math.round(
                            ((analytics?.publications.propertyMarketing || 0) /
                              analytics.publications.total) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider">
              Language Distribution
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 text-center">
              <span className="text-[10px] font-bold text-navy-400 uppercase">Roman Urdu</span>
              <p className="text-xl font-extrabold text-navy-950 mt-1">
                {analytics?.byLanguage['ROMAN_URDU'] ?? 0}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 text-center">
              <span className="text-[10px] font-bold text-navy-400 uppercase">اردو (Script)</span>
              <p className="text-xl font-extrabold text-navy-950 mt-1">
                {analytics?.byLanguage['URDU'] ?? 0}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 text-center">
              <span className="text-[10px] font-bold text-navy-400 uppercase">English</span>
              <p className="text-xl font-extrabold text-navy-950 mt-1">
                {analytics?.byLanguage['ENGLISH'] ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Area & Group Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Lahore Areas */}
        <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider">
              Top Targeted Lahore Societies
            </h3>
          </div>

          {analytics?.topAreas && analytics.topAreas.length > 0 ? (
            <div className="divide-y divide-navy-100 text-xs">
              {analytics.topAreas.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <span className="font-bold text-navy-900">{item.area}</span>
                  <span className="font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full text-[11px]">
                    {item.count} campaigns
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-navy-400 py-6 text-center">No area campaign records yet.</p>
          )}
        </div>

        {/* Top Facebook Groups */}
        <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <Send className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider">
              Top Publishing Facebook Groups
            </h3>
          </div>

          {analytics?.topGroups && analytics.topGroups.length > 0 ? (
            <div className="divide-y divide-navy-100 text-xs">
              {analytics.topGroups.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <span className="font-bold text-navy-900 truncate max-w-[220px]">
                    {item.groupName}
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                    {item.count} confirmed
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-navy-400 py-6 text-center">No confirmed group posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
