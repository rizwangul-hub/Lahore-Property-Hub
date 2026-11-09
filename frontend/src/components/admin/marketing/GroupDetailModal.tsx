'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X,
  Facebook,
  ExternalLink,
  MapPin,
  Clock,
  Shield,
  Languages,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Send,
  Building,
  Globe2,
} from 'lucide-react';
import {
  FacebookGroupItem,
  fetchFacebookGroupById,
  PostingHistoryItem,
} from '@/lib/marketingApi';

interface GroupDetailModalProps {
  groupId: string | null;
  onClose: () => void;
  onEdit: (group: FacebookGroupItem) => void;
}

export default function GroupDetailModal({
  groupId,
  onClose,
  onEdit,
}: GroupDetailModalProps) {
  const [group, setGroup] = useState<FacebookGroupItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadGroup = async () => {
      try {
        const res = await fetchFacebookGroupById(groupId);
        if (!isMounted) return;
        if (res.success && res.data) {
          setGroup(res.data);
        } else {
          setError(res.message || 'Failed to load group details.');
        }
      } catch {
        if (isMounted) setError('Network error fetching group detail.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadGroup();

    return () => {
      isMounted = false;
    };
  }, [groupId]);

  if (!groupId) return null;

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never posted';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-navy-100 overflow-hidden my-8 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy-100 bg-navy-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-950 text-brand-400">
              <Facebook className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy-950">
                {group?.name || 'Facebook Group Detail'}
              </h3>
              <p className="text-xs text-navy-500">Group profile, cooldown status & publication history</p>
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

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-navy-400 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <span className="text-xs font-semibold">Loading group profile & statistics...</span>
            </div>
          ) : error || !group ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error || 'Group not found.'}</span>
            </div>
          ) : (
            <>
              {/* Primary Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100">
                  <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
                    Target Area
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-4 w-4 text-brand-600" />
                    <span className="text-sm font-extrabold text-navy-900">{group.area}</span>
                  </div>
                  {group.subAreaFocus?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {group.subAreaFocus.map((sub) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 rounded-full bg-white text-navy-600 border border-navy-200 text-[10px] font-medium"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100">
                  <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
                    Membership & Language
                  </span>
                  <div className="text-sm font-extrabold text-navy-900 mt-1">
                    {group.membershipType}
                  </div>
                  <div className="text-xs text-navy-600 mt-0.5">
                    Lang: <span className="font-semibold">{group.preferredLanguage}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100">
                  <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
                    Activity & Cooldown
                  </span>
                  <div className="text-sm font-extrabold text-navy-900 mt-1">
                    {group.postingFrequencyLimitHours} Hours limit
                  </div>
                  <div className="text-xs text-navy-600 mt-0.5">
                    Total Published: <span className="font-bold text-brand-600">{group.totalConfirmed ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* URL and Facebook Link */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-navy-100 shadow-subtle">
                <div className="truncate pr-4">
                  <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
                    Group Link
                  </span>
                  <span className="text-xs text-navy-700 truncate block font-mono">
                    {group.groupUrl}
                  </span>
                </div>
                <a
                  href={group.groupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-950 text-brand-400 text-xs font-bold hover:bg-navy-900 transition shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Facebook</span>
                </a>
              </div>

              {/* SEPARATE COOLDOWN INDICATORS (CRITICAL REQUIREMENT) */}
              <div className="p-5 rounded-2xl bg-navy-50 border border-navy-200 space-y-4">
                <span className="text-xs font-extrabold text-navy-950 uppercase tracking-wider block">
                  Campaign Engine Cooldown Indicators
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Website Cooldown */}
                  <div className="p-4 rounded-xl bg-white border border-navy-100 shadow-subtle">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4 text-brand-600" />
                        <span className="text-xs font-bold text-navy-900">Website Marketing</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          group.allowsWebsiteMarketing
                            ? group.cooldown?.isWebsiteInCooldown
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {!group.allowsWebsiteMarketing
                          ? 'Disabled'
                          : group.cooldown?.isWebsiteInCooldown
                          ? 'In Cooldown'
                          : 'Eligible Now'}
                      </span>
                    </div>

                    <p className="text-[11px] text-navy-500">
                      Last Posted:{' '}
                      <span className="font-semibold text-navy-800">
                        {formatDateTime(group.websiteMarketingLastPostedAt)}
                      </span>
                    </p>
                    {group.cooldown?.nextEligibleWebsite && (
                      <p className="text-[11px] text-navy-500 mt-1">
                        Next Eligible:{' '}
                        <span className="font-semibold text-navy-800">
                          {formatDateTime(group.cooldown.nextEligibleWebsite)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Property Cooldown */}
                  <div className="p-4 rounded-xl bg-white border border-navy-100 shadow-subtle">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-bold text-navy-900">Property Marketing</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          group.allowsPropertyAdvertising
                            ? group.cooldown?.isPropertyInCooldown
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {!group.allowsPropertyAdvertising
                          ? 'Disabled'
                          : group.cooldown?.isPropertyInCooldown
                          ? 'In Cooldown'
                          : 'Eligible Now'}
                      </span>
                    </div>

                    <p className="text-[11px] text-navy-500">
                      Last Posted:{' '}
                      <span className="font-semibold text-navy-800">
                        {formatDateTime(group.propertyMarketingLastPostedAt)}
                      </span>
                    </p>
                    {group.cooldown?.nextEligibleProperty && (
                      <p className="text-[11px] text-navy-500 mt-1">
                        Next Eligible:{' '}
                        <span className="font-semibold text-navy-800">
                          {formatDateTime(group.cooldown.nextEligibleProperty)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Group Rules */}
              {group.groupRules && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-bold mb-1">
                    <Shield className="h-4 w-4 text-amber-700" />
                    <span>Facebook Group Rules</span>
                  </div>
                  <p className="text-xs text-amber-950 whitespace-pre-line leading-relaxed">
                    {group.groupRules}
                  </p>
                </div>
              )}

              {/* Recent Publication History for this Group */}
              <div>
                <h4 className="text-xs font-extrabold text-navy-950 uppercase tracking-wider mb-3">
                  Recent Group Publishing History
                </h4>

                {group.recentHistory && group.recentHistory.length > 0 ? (
                  <div className="border border-navy-100 rounded-2xl overflow-hidden divide-y divide-navy-100 bg-white">
                    {group.recentHistory.map((item) => (
                      <div key={item._id} className="p-3.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.campaignType === 'WEBSITE_MARKETING'
                                  ? 'bg-brand-50 text-brand-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {item.campaignType === 'WEBSITE_MARKETING' ? 'Website Promo' : 'Property Ad'}
                            </span>
                            <span className="text-navy-500">{formatDateTime(item.postedAt)}</span>
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-navy-500 mt-1">{item.notes}</p>
                          )}
                        </div>

                        {item.facebookPostUrl && (
                          <a
                            href={item.facebookPostUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:text-brand-800 font-bold inline-flex items-center gap-1 text-[11px]"
                          >
                            <span>View Post</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-navy-200 text-navy-400 text-xs">
                    No confirmed Facebook publications recorded for this group yet.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-navy-100 bg-navy-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-navy-200 text-navy-700 font-bold text-xs hover:bg-navy-100 transition"
          >
            Close
          </button>

          {group && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(group);
              }}
              className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs transition shadow-sm"
            >
              Edit Group Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
