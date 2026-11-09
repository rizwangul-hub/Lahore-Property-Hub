'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  ShoppingBag,
  KeyRound,
  AlertTriangle,
  RotateCcw,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import {
  fetchAdminProperties,
  approvePropertyRequest,
  rejectPropertyRequest,
  changePropertyStatusRequest,
  toggleFeaturePropertyRequest,
  updateAdminPropertyRequest,
  deleteAdminPropertyRequest,
  AdminPropertiesQuery,
} from '@/lib/adminApi';

export interface PropertyManagementTableProps {
  initialStatus?: string; // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  pageTitle: string;
  description: string;
}

export const PropertyManagementTable: React.FC<PropertyManagementTableProps> = ({
  initialStatus = 'ALL',
  pageTitle,
  description,
}) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [status, setStatus] = useState(initialStatus);
  const [listingType, setListingType] = useState('ALL');
  const [propertyType, setPropertyType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  // Modals State
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [rejectingProperty, setRejectingProperty] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadProperties = async () => {
    setLoading(true);
    const query: AdminPropertiesQuery = {
      status,
      listingType,
      propertyType,
      search,
      sort,
      page,
      limit: 15,
    };
    const res = await fetchAdminProperties(query);
    setProperties(res.properties);
    setTotal(res.total);
    setTotalPages(res.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    loadProperties();
  }, [status, listingType, propertyType, sort, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProperties();
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this property and make it publicly visible?')) return;
    setIsActionLoading(true);
    await approvePropertyRequest(id);
    await loadProperties();
    setIsActionLoading(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectingProperty) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 3) {
      alert('Please provide a rejection reason (minimum 3 characters).');
      return;
    }
    setIsActionLoading(true);
    await rejectPropertyRequest(rejectingProperty._id, rejectionReason.trim());
    setRejectingProperty(null);
    setRejectionReason('');
    await loadProperties();
    setIsActionLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`Change property status to ${newStatus}?`)) return;
    setIsActionLoading(true);
    await changePropertyStatusRequest(id, newStatus);
    await loadProperties();
    setIsActionLoading(false);
  };

  const handleToggleFeature = async (id: string, currentFeatured: boolean, propStatus: string) => {
    if (!currentFeatured && propStatus !== 'APPROVED') {
      alert('Only APPROVED properties can be featured.');
      return;
    }
    setIsActionLoading(true);
    await toggleFeaturePropertyRequest(id, !currentFeatured);
    await loadProperties();
    setIsActionLoading(false);
  };

  const handleDelete = async (id: string, refId: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete property ${refId}? This will remove associated images from Cloudinary and cannot be undone.`
      )
    )
      return;
    setIsActionLoading(true);
    await deleteAdminPropertyRequest(id);
    await loadProperties();
    setIsActionLoading(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    setIsActionLoading(true);
    await updateAdminPropertyRequest(editingProperty._id, {
      title: editingProperty.title,
      price: editingProperty.price,
      description: editingProperty.description,
      areaSize: editingProperty.areaSize,
      areaUnit: editingProperty.areaUnit,
      contactInfo: editingProperty.contactInfo,
      details: editingProperty.details,
    });
    setEditingProperty(null);
    await loadProperties();
    setIsActionLoading(false);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Title & Description */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
          {pageTitle}
        </h1>
        <p className="mt-1 text-xs text-navy-500">{description}</p>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="rounded-3xl border border-navy-100 bg-white p-5 shadow-subtle space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, reference ID, contact name, WhatsApp, area..."
              className="w-full rounded-xl border border-navy-200 bg-white py-2.5 pl-10 pr-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-navy-100 text-xs">
          {initialStatus === 'ALL' && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-navy-500">Status:</span>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-navy-200 bg-white py-1.5 px-2.5 text-xs text-navy-800 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved (Live)</option>
                <option value="REJECTED">Rejected</option>
                <option value="SOLD">Sold</option>
                <option value="RENTED">Rented</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-navy-500">Purpose:</span>
            <select
              value={listingType}
              onChange={(e) => {
                setListingType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-navy-200 bg-white py-1.5 px-2.5 text-xs text-navy-800 outline-none"
            >
              <option value="ALL">All Purposes</option>
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
              <option value="WANTED">Wanted Requirements</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-navy-500">Type:</span>
            <select
              value={propertyType}
              onChange={(e) => {
                setPropertyType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-navy-200 bg-white py-1.5 px-2.5 text-xs text-navy-800 outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
              <option value="PLOT">Plot</option>
              <option value="SHOP">Shop</option>
              <option value="OFFICE">Office</option>
              <option value="COMMERCIAL_BUILDING">Commercial</option>
              <option value="WAREHOUSE">Warehouse</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="font-semibold text-navy-500">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-navy-200 bg-white py-1.5 px-2.5 text-xs text-navy-800 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price Low to High</option>
              <option value="price_desc">Price High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table Card */}
      <div className="rounded-3xl border border-navy-100 bg-white shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-navy-500 animate-pulse">
            Loading database properties...
          </div>
        ) : properties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-navy-50/80 border-b border-navy-200 text-navy-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Property & Ref</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Price / Budget</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 text-navy-800">
                {properties.map((p) => {
                  const statusColors: Record<string, string> = {
                    PENDING: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
                    APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
                    REJECTED: 'bg-red-100 text-red-800 border-red-300',
                    SOLD: 'bg-blue-100 text-blue-800 border-blue-300',
                    RENTED: 'bg-purple-100 text-purple-800 border-purple-300',
                    EXPIRED: 'bg-gray-100 text-gray-800 border-gray-300',
                  };

                  return (
                    <tr key={p._id} className="hover:bg-navy-50/50 transition">
                      {/* Title & Ref */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded">
                            {p.referenceId}
                          </span>
                          {p.isFeatured && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded flex items-center gap-0.5">
                              <Sparkles className="h-2.5 w-2.5" /> Featured
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-navy-950 truncate mt-1">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-navy-500">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="font-bold uppercase text-[10px] bg-navy-100 px-2 py-0.5 rounded">
                          {p.listingType}
                        </span>
                        <div className="text-[11px] text-navy-600 capitalize mt-0.5">
                          {p.propertyType.toLowerCase()}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="font-semibold">{p.location?.area}</div>
                        <div className="text-[11px] text-navy-500">
                          {p.location?.city} {p.location?.block && `(Blk ${p.location.block})`}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-brand-700">
                        {p.listingType === 'WANTED'
                          ? `PKR ${new Intl.NumberFormat('en-PK').format(p.budgetMin || 0)} - ${new Intl.NumberFormat('en-PK').format(p.budgetMax || 0)}`
                          : `PKR ${new Intl.NumberFormat('en-PK').format(p.price || 0)}`}
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="font-semibold">{p.contactInfo?.contactName}</div>
                        <div className="text-[11px] text-navy-500 font-mono">
                          {p.contactInfo?.whatsappNumber}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${
                            statusColors[p.status] || 'bg-navy-100 text-navy-700'
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.status === 'REJECTED' && p.rejectionReason && (
                          <div className="text-[10px] text-red-600 line-clamp-1 mt-0.5" title={p.rejectionReason}>
                            Reason: {p.rejectionReason}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => setSelectedProperty(p)}
                            className="p-1.5 rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-50"
                            title="Inspect full details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Quick Approve / Reject for PENDING */}
                          {p.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => handleApprove(p._id)}
                                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                title="Approve Listing"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => {
                                  setRejectingProperty(p);
                                  setRejectionReason('');
                                }}
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                                title="Reject Listing"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}

                          {/* Feature toggle for APPROVED */}
                          {p.status === 'APPROVED' && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleToggleFeature(p._id, p.isFeatured, p.status)}
                              className={`p-1.5 rounded-lg border ${
                                p.isFeatured
                                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                                  : 'border-navy-200 text-navy-500 hover:bg-navy-50'
                              }`}
                              title={p.isFeatured ? 'Unfeature property' : 'Feature on homepage'}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => setEditingProperty({ ...p })}
                            className="p-1.5 rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-50"
                            title="Edit details"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleDelete(p._id, p.referenceId)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                            title="Delete property"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-navy-500">
            No properties found matching the selected filters.
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-navy-100 flex items-center justify-between text-xs">
            <span className="text-navy-500">
              Total {total} properties &bull; Page {page} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="p-1.5 rounded-lg border border-navy-200 text-navy-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-1.5 rounded-lg border border-navy-200 text-navy-700 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INSPECT DETAILS MODAL */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-navy-800">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                  {selectedProperty.referenceId}
                </span>
                <span className="ml-2 font-bold uppercase text-navy-600">
                  {selectedProperty.listingType} &bull; {selectedProperty.propertyType}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="p-1 text-navy-400 hover:text-navy-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h3 className="text-base font-extrabold text-navy-950">{selectedProperty.title}</h3>

            {/* Images Preview */}
            {selectedProperty.images && selectedProperty.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedProperty.images.map((img: any, i: number) => (
                  <div key={i} className="relative h-24 rounded-xl overflow-hidden border border-navy-200">
                    <Image src={img.secureUrl} alt="Preview" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 bg-navy-50 p-4 rounded-2xl">
              <div>
                <span className="text-navy-400 block font-semibold">Demand / Budget:</span>
                <span className="font-extrabold text-brand-700 text-sm">
                  PKR {new Intl.NumberFormat('en-PK').format(selectedProperty.price || 0)}
                </span>
              </div>
              <div>
                <span className="text-navy-400 block font-semibold">Area Size:</span>
                <span className="font-bold">{selectedProperty.areaSize} {selectedProperty.areaUnit}</span>
              </div>
              <div>
                <span className="text-navy-400 block font-semibold">Location:</span>
                <span className="font-bold">{selectedProperty.location?.area}, {selectedProperty.location?.city}</span>
              </div>
              <div>
                <span className="text-navy-400 block font-semibold">Contact:</span>
                <span className="font-bold">{selectedProperty.contactInfo?.contactName} ({selectedProperty.contactInfo?.whatsappNumber})</span>
              </div>
            </div>

            <div>
              <span className="text-navy-400 block font-semibold mb-1">Description:</span>
              <p className="bg-navy-50/50 p-3 rounded-xl whitespace-pre-line leading-relaxed">
                {selectedProperty.description}
              </p>
            </div>

            {selectedProperty.facilities && selectedProperty.facilities.length > 0 && (
              <div>
                <span className="text-navy-400 block font-semibold mb-1">Facilities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProperty.facilities.map((f: string, i: number) => (
                    <span key={i} className="bg-brand-50 text-brand-800 border border-brand-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Status Changers */}
            <div className="border-t border-navy-100 pt-4 flex flex-wrap gap-2">
              {selectedProperty.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleApprove(selectedProperty._id);
                      setSelectedProperty(null);
                    }}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-bold"
                  >
                    Approve Listing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingProperty(selectedProperty);
                      setSelectedProperty(null);
                    }}
                    className="rounded-xl border border-red-200 text-red-600 px-4 py-2 font-bold"
                  >
                    Reject Listing
                  </button>
                </>
              )}

              {selectedProperty.status === 'APPROVED' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleStatusChange(selectedProperty._id, 'SOLD');
                      setSelectedProperty(null);
                    }}
                    className="rounded-xl bg-blue-600 text-white px-3 py-2 font-bold"
                  >
                    Mark as Sold
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleStatusChange(selectedProperty._id, 'RENTED');
                      setSelectedProperty(null);
                    }}
                    className="rounded-xl bg-purple-600 text-white px-3 py-2 font-bold"
                  >
                    Mark as Rented
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleStatusChange(selectedProperty._id, 'EXPIRED');
                      setSelectedProperty(null);
                    }}
                    className="rounded-xl border border-navy-300 text-navy-700 px-3 py-2 font-bold"
                  >
                    Mark as Expired
                  </button>
                </>
              )}

              {selectedProperty.status === 'APPROVED' && (
                <Link
                  href={`/property/${selectedProperty.slug}`}
                  target="_blank"
                  className="ml-auto inline-flex items-center gap-1.5 text-brand-700 font-bold p-2"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT WITH REASON MODAL */}
      {rejectingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-navy-950">
              Reject Listing: {rejectingProperty.referenceId}
            </h3>
            <p className="text-navy-600 leading-relaxed">
              Please enter the specific reason for rejecting this property. The reason will be
              stored in the database and audit logs.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Unclear photos, incomplete address, or duplicate submission..."
              className="w-full rounded-xl border border-navy-200 p-2.5 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingProperty(null)}
                className="rounded-xl border border-navy-200 px-4 py-2 font-semibold text-navy-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleConfirmReject}
                className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 space-y-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <h3 className="text-sm font-extrabold text-navy-950">
                Edit Property: {editingProperty.referenceId}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="text-navy-400 hover:text-navy-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1">Title</label>
              <input
                type="text"
                value={editingProperty.title}
                onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                className="w-full rounded-xl border border-navy-200 p-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Price (PKR)</label>
                <input
                  type="number"
                  value={editingProperty.price || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, price: Number(e.target.value) })}
                  className="w-full rounded-xl border border-navy-200 p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Area Size</label>
                <input
                  type="number"
                  value={editingProperty.areaSize || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, areaSize: Number(e.target.value) })}
                  className="w-full rounded-xl border border-navy-200 p-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea
                rows={4}
                value={editingProperty.description}
                onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                className="w-full rounded-xl border border-navy-200 p-2 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-navy-100">
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="rounded-xl border border-navy-200 px-4 py-2 font-semibold text-navy-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActionLoading}
                className="rounded-xl bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
