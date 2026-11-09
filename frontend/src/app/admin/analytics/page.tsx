'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MessageCircle,
  Send,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Calendar,
  Sparkles,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { fetchAdminAnalytics } from '@/lib/adminApi';
import { AnalyticsData } from '@/types';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchAdminAnalytics();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <span className="text-xs font-semibold text-navy-500">
            Computing real marketplace analytics...
          </span>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalViews: 0,
    totalWhatsAppClicks: 0,
    totalEnquiries: 0,
    conversionRate: 0,
  };

  const topProperties = data?.topViewedProperties || [];
  const listingTypes = data?.enquiriesByListingType || [];
  const trends = data?.trends || [];

  const maxViews = Math.max(1, ...trends.map((t) => t.views));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
            Marketplace Analytics & Traffic Insights
          </h1>
          <p className="mt-1 text-xs text-navy-500">
            Real privacy-conscious visitor interactions and lead conversions recorded in MongoDB.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-navy-200 bg-white px-3 py-2 text-xs font-bold text-navy-700 shadow-subtle hover:bg-navy-50 transition"
        >
          <RefreshCw className="h-3.5 w-3.5 text-brand-600" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Page Views */}
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Property Page Views</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-navy-950">
            {summary.totalViews.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-navy-400">Deduplicated unique views</p>
        </div>

        {/* WhatsApp Inquiries */}
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">WhatsApp Clicks</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <MessageCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-emerald-700">
            {summary.totalWhatsAppClicks.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-navy-400">Direct click-to-chat engagements</p>
        </div>

        {/* Form Enquiries */}
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Form Enquiries</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-navy-950">
            {summary.totalEnquiries.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-navy-400">Submitted buyer & tenant leads</p>
        </div>

        {/* Lead Conversion Rate */}
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lead Conversion</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-brand-700">
            {summary.conversionRate}%
          </div>
          <p className="mt-1 text-[11px] text-navy-400">Interactions / Views ratio</p>
        </div>
      </div>

      {/* 14-Day Activity Trend Chart */}
      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900">14-Day Engagement Trends</h2>
            <p className="text-xs text-navy-400">Daily breakdown of page views, WhatsApp clicks, and enquiries</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-blue-600">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span>Views</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>WhatsApp</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-600">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span>Enquiries</span>
            </div>
          </div>
        </div>

        {trends.length === 0 ? (
          <div className="py-12 text-center text-xs text-navy-400">
            No visitor interactions recorded yet in the last 14 days.
          </div>
        ) : (
          <div className="pt-4">
            <div className="grid grid-cols-14 gap-1.5 h-44 items-end border-b border-navy-100 pb-2">
              {trends.map((item, idx) => {
                const viewHeight = Math.max(8, Math.round((item.views / maxViews) * 100));
                const shortDate = item.date.substring(5); // MM-DD
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      <div
                        style={{ height: `${viewHeight}%` }}
                        className="w-full rounded-t bg-blue-500/80 group-hover:bg-blue-600 transition"
                        title={`${item.date}: ${item.views} Views, ${item.whatsappClicks} WhatsApp clicks, ${item.enquiries} Enquiries`}
                      />
                    </div>
                    <span className="text-[9px] text-navy-400 font-mono scale-90">{shortDate}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Viewed Approved Properties */}
        <div className="lg:col-span-2 rounded-2xl border border-navy-100 bg-white p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">Most Viewed Properties</h2>
              <p className="text-xs text-navy-400">Highest organically viewed active listings</p>
            </div>
            <Link
              href="/admin/properties/approved"
              className="text-xs font-bold text-brand-600 hover:text-brand-800"
            >
              Manage Listings &rarr;
            </Link>
          </div>

          {topProperties.length === 0 ? (
            <div className="py-8 text-center text-xs text-navy-400">
              No approved properties have recorded views yet.
            </div>
          ) : (
            <div className="divide-y divide-navy-50">
              {topProperties.map((prop: any) => (
                <div key={prop._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-navy-900 truncate">{prop.title}</div>
                    <div className="flex items-center gap-2 text-[11px] text-navy-400 mt-0.5">
                      <span>{prop.location?.area || 'Lahore'}</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-brand-600">
                        PKR {prop.price ? Number(prop.price).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-bold text-navy-700">
                      <Eye className="h-3.5 w-3.5 text-navy-400" />
                      <span>{prop.views || 0} views</span>
                    </span>
                    <Link
                      href={`/property/${prop.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-navy-400 hover:text-navy-900 hover:bg-navy-50 transition"
                      title="View public listing"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Listing Type Distribution */}
        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-subtle space-y-4">
          <div>
            <h2 className="text-base font-bold text-navy-900">Leads by Category</h2>
            <p className="text-xs text-navy-400">Enquiries grouped by purpose</p>
          </div>

          {listingTypes.length === 0 ? (
            <div className="py-8 text-center text-xs text-navy-400">
              No enquiries recorded yet.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {listingTypes.map((item) => {
                const totalEnquiries = summary.totalEnquiries || 1;
                const pct = Math.round((item.count / totalEnquiries) * 100);
                return (
                  <div key={item.type} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-navy-800">
                      <span>{item.type}</span>
                      <span>{item.count} leads ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-navy-100 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-brand-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="rounded-xl bg-navy-50/80 p-3.5 text-[11px] text-navy-600 leading-relaxed space-y-1">
            <span className="font-bold text-navy-800">Direct WhatsApp Dominance:</span>
            <p>
              In Pakistan, over 70% of property inquiries occur via direct WhatsApp. Both click-to-chat and form submissions are monitored in real time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
