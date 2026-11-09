'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  Filter,
  Calendar,
  ExternalLink,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  FileText,
  User,
  Shield,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  fetchAdminEnquiries,
  updateEnquiryStatusRequest,
  updateEnquiryNotesRequest,
  deleteEnquiryRequest,
} from '@/lib/adminApi';
import { EnquiryItem, EnquiryStatus } from '@/types';

const STATUS_CONFIG: Record<
  EnquiryStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  NEW: { label: 'New Lead', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  CONTACTED: { label: 'Contacted', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  FOLLOW_UP: { label: 'Follow Up', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  CONVERTED: { label: 'Converted', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  CLOSED: { label: 'Closed', bg: 'bg-navy-100 border-navy-200', text: 'text-navy-600', dot: 'bg-navy-400' },
};

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Enquiry for Detail Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [currentNotes, setCurrentNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminEnquiries({
        status: statusFilter,
        search: searchQuery,
        startDate,
        endDate,
        page,
        limit: 15,
      });

      setEnquiries(res.enquiries);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, startDate, endDate, page]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  // Open Enquiry Details
  const handleOpenDetails = (enquiry: EnquiryItem) => {
    setSelectedEnquiry(enquiry);
    setCurrentNotes(enquiry.adminNotes || '');
    setActionSuccess('');
  };

  // Change Enquiry Status
  const handleStatusChange = async (enquiryId: string, newStatus: EnquiryStatus) => {
    const success = await updateEnquiryStatusRequest(enquiryId, newStatus);
    if (success) {
      setEnquiries((prev) =>
        prev.map((e) => (e._id === enquiryId ? { ...e, status: newStatus } : e))
      );
      if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }
      setActionSuccess(`Status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  // Save Internal Notes
  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setSavingNotes(true);
    const success = await updateEnquiryNotesRequest(selectedEnquiry._id, currentNotes);
    if (success) {
      setEnquiries((prev) =>
        prev.map((e) =>
          e._id === selectedEnquiry._id ? { ...e, adminNotes: currentNotes } : e
        )
      );
      setSelectedEnquiry({ ...selectedEnquiry, adminNotes: currentNotes });
      setActionSuccess('Internal notes saved successfully');
      setTimeout(() => setActionSuccess(''), 3000);
    }
    setSavingNotes(false);
  };

  // Delete Enquiry
  const handleDeleteEnquiry = async (enquiryId: string) => {
    if (!window.confirm('Are you sure you want to delete this enquiry record?')) return;
    const success = await deleteEnquiryRequest(enquiryId);
    if (success) {
      setEnquiries((prev) => prev.filter((e) => e._id !== enquiryId));
      if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
        setSelectedEnquiry(null);
      }
      setTotal((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
            Lead Management & Customer Enquiries
          </h1>
          <p className="mt-1 text-xs text-navy-500">
            Real prospective buyer and tenant enquiries recorded in MongoDB ({total} Total Records)
          </p>
        </div>

        <button
          type="button"
          onClick={loadEnquiries}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-navy-200 bg-white px-3 py-2 text-xs font-bold text-navy-700 shadow-subtle hover:bg-navy-50 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-brand-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-subtle space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          {['ALL', 'NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
              }`}
            >
              {st === 'ALL' ? 'All Leads' : STATUS_CONFIG[st as EnquiryStatus]?.label || st}
            </button>
          ))}
        </div>

        {/* Search & Date Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-navy-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer name, WhatsApp, or property title..."
              className="w-full rounded-xl border border-navy-200 bg-navy-50/50 py-2 pl-9 pr-3 text-xs text-navy-900 placeholder:text-navy-400 focus:border-brand-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Start Date */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-navy-200 bg-navy-50/50 py-2 px-3 text-xs text-navy-700 focus:border-brand-500 focus:bg-white focus:outline-none transition"
              title="Filter from start date"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-navy-200 bg-navy-50/50 py-2 px-3 text-xs text-navy-700 focus:border-brand-500 focus:bg-white focus:outline-none transition"
              title="Filter to end date"
            />
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl border border-navy-100 bg-white shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            <p className="mt-3 text-xs font-semibold text-navy-500">Loading customer enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <MessageSquare className="h-10 w-10 text-navy-300 mx-auto" />
            <h3 className="text-sm font-bold text-navy-800">No Enquiries Found</h3>
            <p className="text-xs text-navy-500 max-w-sm mx-auto">
              No customer lead submissions match your active filter criteria. Real enquiries submitted from property detail pages will populate here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-50/80 text-navy-600 border-b border-navy-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Customer Details</th>
                  <th className="px-4 py-3.5 font-bold">Property Reference</th>
                  <th className="px-4 py-3.5 font-bold">Preferred Contact</th>
                  <th className="px-4 py-3.5 font-bold">Date Received</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {enquiries.map((enquiry) => {
                  const cfg = STATUS_CONFIG[enquiry.status] || STATUS_CONFIG.NEW;
                  const propertyData = typeof enquiry.propertyId === 'object' ? enquiry.propertyId : null;
                  const propertySlug = propertyData?.slug || '';

                  return (
                    <tr key={enquiry._id} className="hover:bg-navy-50/50 transition">
                      {/* Customer Info */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-navy-900">{enquiry.customerName}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-navy-500 text-[11px]">
                          <span className="font-mono">{enquiry.customerPhone}</span>
                          {enquiry.customerEmail && (
                            <>
                              <span>&bull;</span>
                              <span className="truncate max-w-[140px]">{enquiry.customerEmail}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Property Title */}
                      <td className="px-4 py-4 max-w-[220px]">
                        <div className="font-semibold text-navy-900 truncate" title={enquiry.propertyTitle}>
                          {enquiry.propertyTitle}
                        </div>
                        {propertySlug ? (
                          <Link
                            href={`/property/${propertySlug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-800 font-medium mt-0.5"
                          >
                            <span>View Property</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-[10px] text-navy-400">Ref: {enquiry.propertyReferenceId || 'N/A'}</span>
                        )}
                      </td>

                      {/* Preferred Contact Method */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-50 border border-navy-100 text-[10px] font-bold text-navy-700">
                          {enquiry.preferredContactMethod === 'WHATSAPP' && <MessageCircle className="h-3 w-3 text-emerald-600" />}
                          {enquiry.preferredContactMethod === 'PHONE' && <Phone className="h-3 w-3 text-blue-600" />}
                          {enquiry.preferredContactMethod === 'EMAIL' && <Mail className="h-3 w-3 text-purple-600" />}
                          <span>{enquiry.preferredContactMethod}</span>
                        </span>
                      </td>

                      {/* Submission Date */}
                      <td className="px-4 py-4 text-navy-500 text-[11px] whitespace-nowrap">
                        {new Date(enquiry.createdAt).toLocaleDateString('en-PK', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Status Dropdown Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={enquiry.status}
                          onChange={(e) => handleStatusChange(enquiry._id, e.target.value as EnquiryStatus)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${cfg.bg} ${cfg.text}`}
                        >
                          <option value="NEW">New Lead</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="FOLLOW_UP">Follow Up</option>
                          <option value="CONVERTED">Converted</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp Customer CTA */}
                          <a
                            href={`https://wa.me/${enquiry.customerPhone.replace(/[\s\-\(\)\+]/g, '')}?text=${encodeURIComponent(
                              `Hello ${enquiry.customerName}, thank you for your enquiry on Lahore Property Hub regarding "${enquiry.propertyTitle}". How may we assist you?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            title="Chat with customer on WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>

                          {/* Inspect Modal Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(enquiry)}
                            className="p-1.5 rounded-lg text-navy-700 hover:bg-navy-100 transition"
                            title="View enquiry message & notes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteEnquiry(enquiry._id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                            title="Delete enquiry record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-navy-100 text-xs">
            <span className="text-navy-500">
              Page {page} of {totalPages} ({total} Total Enquiries)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-navy-200 text-navy-600 hover:bg-navy-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-navy-200 text-navy-600 hover:bg-navy-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: View Full Enquiry & Manage Internal Notes */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-navy-100 p-6 space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-navy-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                  Lead Enquiry Details
                </span>
                <h3 className="text-lg font-extrabold text-navy-950">
                  {selectedEnquiry.customerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-navy-50 p-3">
                <span className="text-[10px] font-semibold text-navy-400 uppercase">WhatsApp</span>
                <div className="font-bold text-navy-900 mt-0.5">{selectedEnquiry.customerPhone}</div>
              </div>
              <div className="rounded-xl bg-navy-50 p-3">
                <span className="text-[10px] font-semibold text-navy-400 uppercase">Email</span>
                <div className="font-bold text-navy-900 mt-0.5 truncate">
                  {selectedEnquiry.customerEmail || 'Not provided'}
                </div>
              </div>
              <div className="rounded-xl bg-navy-50 p-3">
                <span className="text-[10px] font-semibold text-navy-400 uppercase">Preferred Contact</span>
                <div className="font-bold text-navy-900 mt-0.5">{selectedEnquiry.preferredContactMethod}</div>
              </div>
            </div>

            {/* Property Reference Card */}
            <div className="rounded-xl border border-navy-100 p-3.5 bg-navy-50/40 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
                Associated Property
              </span>
              <div className="font-bold text-xs text-navy-900">
                {selectedEnquiry.propertyTitle}
              </div>
              {typeof selectedEnquiry.propertyId === 'object' && selectedEnquiry.propertyId?.slug && (
                <Link
                  href={`/property/${selectedEnquiry.propertyId.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-800"
                >
                  <span>Open Public Property Page</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1.5">
                Customer Message
              </label>
              <div className="rounded-xl border border-navy-100 bg-navy-50/60 p-3.5 text-xs text-navy-800 leading-relaxed whitespace-pre-wrap">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1.5">
                Lead Moderation Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED'] as EnquiryStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(selectedEnquiry._id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      selectedEnquiry.status === st
                        ? 'border-brand-600 bg-brand-50 text-brand-800'
                        : 'border-navy-200 bg-white text-navy-600 hover:bg-navy-50'
                    }`}
                  >
                    {STATUS_CONFIG[st].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Private Internal Admin Notes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-navy-800">
                  <Shield className="h-3.5 w-3.5 text-brand-600" />
                  <span>Internal Admin Notes (Private & Confidential)</span>
                </label>
                <span className="text-[10px] text-navy-400">Only visible to administrators</span>
              </div>
              <textarea
                rows={3}
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Log customer discussions, inspection appointments, counter-offers, or dealer assignments..."
                className="w-full rounded-xl border border-navy-200 bg-white p-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none transition resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-navy-100">
              <a
                href={`https://wa.me/${selectedEnquiry.customerPhone.replace(/[\s\-\(\)\+]/g, '')}?text=${encodeURIComponent(
                  `Hello ${selectedEnquiry.customerName}, following up on your enquiry for "${selectedEnquiry.propertyTitle}".`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat via WhatsApp</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-xs font-bold text-navy-600 hover:bg-navy-50 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={savingNotes}
                  onClick={handleSaveNotes}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
