'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  KeyRound,
  AlertTriangle,
  FileText,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Activity,
  MessageSquare,
  BarChart3,
  TrendingUp,
  User,
  Phone,
} from 'lucide-react';
import {
  fetchDashboardStats,
  DashboardStatsData,
  approvePropertyRequest,
  rejectPropertyRequest,
} from '@/lib/adminApi';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchDashboardStats();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickApprove = async (id: string) => {
    if (!confirm('Approve this listing and make it publicly live?')) return;
    setActionLoadingId(id);
    await approvePropertyRequest(id);
    await loadData();
    setActionLoadingId(null);
  };

  const handleQuickReject = async (id: string) => {
    const reason = prompt('Please enter the rejection reason for this listing:');
    if (!reason || reason.trim().length < 3) {
      alert('Rejection reason must be at least 3 characters.');
      return;
    }
    setActionLoadingId(id);
    await rejectPropertyRequest(id, reason.trim());
    await loadData();
    setActionLoadingId(null);
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-navy-200 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-navy-100" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, enquiryStats, awaitingApproval, recentActivity, recentEnquiries } = data;

  const STAT_CARDS = [
    { label: 'Total Properties', count: stats.total, icon: Layers, color: 'text-navy-900', bg: 'bg-navy-100' },
    {
      label: 'Pending Approval',
      count: stats.pending,
      icon: Clock,
      color: 'text-amber-700 font-extrabold',
      bg: 'bg-amber-100',
      badge: stats.pending > 0 ? 'Requires Action' : undefined,
    },
    { label: 'Approved & Live', count: stats.approved, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100' },
    { label: 'Rejected Listings', count: stats.rejected, icon: XCircle, color: 'text-red-700', bg: 'bg-red-100' },
    { label: 'Properties Sold', count: stats.sold, icon: ShoppingBag, color: 'text-blue-700', bg: 'bg-blue-100' },
    { label: 'Properties Rented', count: stats.rented, icon: KeyRound, color: 'text-purple-700', bg: 'bg-purple-100' },
    { label: 'Expired Listings', count: stats.expired, icon: AlertTriangle, color: 'text-gray-700', bg: 'bg-gray-100' },
    { label: 'Wanted Posts', count: stats.wanted, icon: FileText, color: 'text-brand-700', bg: 'bg-brand-100' },
  ];

  const ENQUIRY_CARDS = [
    { label: 'Total Leads', count: enquiryStats?.total || 0, icon: MessageSquare, color: 'text-navy-900', bg: 'bg-navy-100' },
    { label: 'New Leads', count: enquiryStats?.new || 0, icon: Sparkles, color: 'text-blue-700 font-extrabold', bg: 'bg-blue-100' },
    { label: 'Contacted', count: enquiryStats?.contacted || 0, icon: Phone, color: 'text-amber-700', bg: 'bg-amber-100' },
    { label: 'Follow Up', count: enquiryStats?.followUp || 0, icon: Clock, color: 'text-purple-700', bg: 'bg-purple-100' },
    { label: 'Converted', count: enquiryStats?.converted || 0, icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Overview Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
          Executive Dashboard Overview
        </h1>
        <p className="mt-1 text-xs text-navy-500">
          Real-time metrics, moderation pipeline, and prospective customer lead activity.
        </p>
      </div>

      {/* Property Inventory Metric Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-navy-400">
          Property Inventory & Moderation Status
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-navy-100 bg-white p-5 shadow-subtle hover:border-navy-200 transition"
              >
                {card.badge && (
                  <span className="absolute top-3 right-3 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider animate-pulse">
                    {card.badge}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                    <Icon className="h-5 w-5 text-navy-800" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-navy-400 uppercase tracking-wider">
                      {card.label}
                    </div>
                    <div className={`text-2xl font-black tracking-tight ${card.color}`}>
                      {card.count}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Management Metric Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-400">
            Customer Lead Enquiries (Phase 6)
          </h2>
          <Link
            href="/admin/enquiries"
            className="text-xs font-bold text-brand-600 hover:text-brand-800"
          >
            Manage All Leads &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {ENQUIRY_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-navy-100 bg-white p-4 shadow-subtle hover:border-navy-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                    <Icon className="h-4 w-4 text-navy-800" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-navy-400 uppercase tracking-wider">
                      {card.label}
                    </div>
                    <div className={`text-xl font-black tracking-tight ${card.color}`}>
                      {card.count}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Awaiting Moderation Queue */}
      <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-navy-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
              Pending Submissions Awaiting Moderation
            </h3>
          </div>
          <Link
            href="/admin/properties/pending"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View Full Queue ({stats.pending})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {awaitingApproval && awaitingApproval.length > 0 ? (
          <div className="divide-y divide-navy-50">
            {awaitingApproval.map((prop: any) => (
              <div
                key={prop._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-700">
                      [{prop.referenceId}]
                    </span>
                    <span className="text-xs font-bold text-navy-900 truncate">{prop.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-navy-500 mt-1">
                    <span>{prop.location?.area || 'Lahore'}</span>
                    <span>&bull;</span>
                    <span className="font-semibold text-brand-600">
                      PKR {prop.price ? Number(prop.price).toLocaleString() : 'N/A'}
                    </span>
                    <span>&bull;</span>
                    <span>By {prop.contactInfo?.contactName || 'Public User'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    disabled={actionLoadingId === prop._id}
                    onClick={() => handleQuickApprove(prop._id)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition disabled:opacity-50"
                  >
                    Quick Approve
                  </button>
                  <button
                    type="button"
                    disabled={actionLoadingId === prop._id}
                    onClick={() => handleQuickReject(prop._id)}
                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-navy-500">
            ✅ All submissions are currently moderated. No properties awaiting review.
          </div>
        )}
      </div>

      {/* 2-Column Split: Recent Leads & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Enquiries Preview */}
        <div className="lg:col-span-2 rounded-3xl border border-navy-100 bg-white p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-brand-600" />
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                Recent Customer Leads
              </h3>
            </div>
            <Link
              href="/admin/enquiries"
              className="text-xs font-bold text-brand-600 hover:text-brand-800"
            >
              Open Lead Portal &rarr;
            </Link>
          </div>

          {recentEnquiries && recentEnquiries.length > 0 ? (
            <div className="divide-y divide-navy-50 text-xs">
              {recentEnquiries.map((enq: any) => (
                <div key={enq._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-navy-900 truncate">
                      {enq.customerName} &bull; <span className="font-mono text-navy-500 font-normal">{enq.customerPhone}</span>
                    </div>
                    <div className="text-[11px] text-navy-500 truncate mt-0.5">
                      For: &quot;{enq.propertyTitle}&quot;
                    </div>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {enq.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-navy-400 py-6 text-center">
              No customer lead submissions recorded yet.
            </p>
          )}
        </div>

        {/* Quick Management Links */}
        <div className="lg:col-span-1 rounded-3xl border border-navy-100 bg-white p-6 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider pb-3 border-b border-navy-100">
            Quick Actions
          </h3>

          <div className="space-y-2">
            <Link
              href="/admin/enquiries"
              className="flex items-center justify-between p-3 rounded-xl border border-navy-100 hover:border-brand-400 hover:bg-brand-50/40 transition group"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-brand-600" />
                <span className="text-xs font-bold text-navy-900">Lead Management</span>
              </div>
              <span className="font-mono text-xs font-black text-brand-700">
                {enquiryStats?.total || 0}
              </span>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center justify-between p-3 rounded-xl border border-navy-100 hover:border-blue-400 hover:bg-blue-50/40 transition group"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-navy-900">Market Analytics</span>
              </div>
              <span className="text-xs font-bold text-blue-600">View &rarr;</span>
            </Link>

            <Link
              href="/admin/properties/pending"
              className="flex items-center justify-between p-3 rounded-xl border border-navy-100 hover:border-amber-400 hover:bg-amber-50/40 transition group"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-navy-900">Pending Queue</span>
              </div>
              <span className="font-mono text-xs font-black text-amber-700">
                {stats.pending}
              </span>
            </Link>

            <Link
              href="/admin/properties/approved"
              className="flex items-center justify-between p-3 rounded-xl border border-navy-100 hover:border-emerald-400 hover:bg-emerald-50/40 transition group"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-navy-900">Approved Properties</span>
              </div>
              <span className="font-mono text-xs font-black text-emerald-700">
                {stats.approved}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
