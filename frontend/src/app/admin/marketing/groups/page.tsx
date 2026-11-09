'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Facebook,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Globe2,
  Building,
  RotateCw,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import {
  FacebookGroupItem,
  fetchFacebookGroups,
  deleteFacebookGroup,
  updateFacebookGroup,
} from '@/lib/marketingApi';
import MarketingNav from '@/components/admin/marketing/MarketingNav';
import GroupFormModal from '@/components/admin/marketing/GroupFormModal';
import GroupDetailModal from '@/components/admin/marketing/GroupDetailModal';

const LAHORE_AREAS = [
  'All',
  'All Lahore',
  'Bahria Town',
  'DHA Defence',
  'Johar Town',
  'Gulberg',
  'Model Town',
  'Wapda Town',
  'Valencia Town',
  'Askari',
  'Lake City',
  'Raiwind Road',
  'Maraka',
  'Lahore Cantt',
];

export default function FacebookGroupsPage() {
  const [groups, setGroups] = useState<FacebookGroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedMembership, setSelectedMembership] = useState('All');
  const [selectedPermission, setSelectedPermission] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FacebookGroupItem | null>(null);
  const [detailGroupId, setDetailGroupId] = useState<string | null>(null);

  // Deletion confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadGroups = async () => {
    try {
      const params: any = { limit: 100 };
      if (selectedArea !== 'All') params.area = selectedArea;
      if (selectedStatus === 'Active') params.active = true;
      if (selectedStatus === 'Inactive') params.active = false;
      if (selectedPermission === 'Website') params.allowsWebsite = true;
      if (selectedPermission === 'Property') params.allowsProperty = true;

      const res = await fetchFacebookGroups(params);
      if (res.success && res.data) {
        setGroups(res.data);
      } else {
        showToast(res.message || 'Failed to load Facebook groups.', 'error');
      }
    } catch {
      showToast('Network error loading groups.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [selectedArea, selectedStatus, selectedPermission]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from marketing tracking?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteFacebookGroup(id);
      if (res.success) {
        showToast(`Group "${name}" removed.`, 'success');
        setGroups(groups.filter((g) => g._id !== id));
      } else {
        showToast(res.message || 'Failed to delete group.', 'error');
      }
    } catch {
      showToast('Network error deleting group.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (group: FacebookGroupItem) => {
    try {
      const newActive = !group.isActive;
      const res = await updateFacebookGroup(group._id, { isActive: newActive });
      if (res.success) {
        showToast(`"${group.name}" is now ${newActive ? 'Active' : 'Deactivated'}.`, 'success');
        setGroups(
          groups.map((g) => (g._id === group._id ? { ...g, isActive: newActive } : g))
        );
      } else {
        showToast(res.message || 'Failed to update status.', 'error');
      }
    } catch {
      showToast('Network error updating group.', 'error');
    }
  };

  // Client-side search & secondary filters
  const filteredGroups = groups.filter((g) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = g.name.toLowerCase().includes(q);
      const matchArea = g.area.toLowerCase().includes(q);
      const matchNotes = (g.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchArea && !matchNotes) return false;
    }
    if (selectedMembership !== 'All' && g.membershipType !== selectedMembership) {
      return false;
    }
    if (selectedLanguage !== 'All' && g.preferredLanguage !== selectedLanguage) {
      return false;
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
            Facebook Group Directory
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Manage target groups, configure dual-engine permissions, and track cooldown limits across Lahore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={refreshing}
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 px-3.5 py-2.5 text-xs font-bold transition shadow-subtle disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingGroup(null);
              setIsFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Facebook Group</span>
          </button>
        </div>
      </div>

      {/* Sub Nav */}
      <MarketingNav />

      {/* Search & Filters Card */}
      <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-navy-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups by name, society, or notes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-navy-50/50"
            />
          </div>

          {/* Area Filter */}
          <div className="w-full md:w-52">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {LAHORE_AREAS.map((a) => (
                <option key={a} value={a}>
                  Area: {a}
                </option>
              ))}
            </select>
          </div>

          {/* Permission Filter */}
          <div className="w-full md:w-52">
            <select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="All">All Permissions</option>
              <option value="Website">Allows Website Promo</option>
              <option value="Property">Allows Property Ads</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Pills */}
        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-navy-100 text-xs">
          <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider">
            Quick Filters:
          </span>

          {/* Membership Filter */}
          <select
            value={selectedMembership}
            onChange={(e) => setSelectedMembership(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-navy-200 text-[11px] font-semibold text-navy-700 bg-white"
          >
            <option value="All">All Memberships</option>
            <option value="MEMBER">Ordinary Member</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Language Filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-navy-200 text-[11px] font-semibold text-navy-700 bg-white"
          >
            <option value="All">All Languages</option>
            <option value="ROMAN_URDU">Roman Urdu</option>
            <option value="URDU">Urdu (اردو)</option>
            <option value="ENGLISH">English</option>
            <option value="BILINGUAL">Bilingual</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-navy-200 text-[11px] font-semibold text-navy-700 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          <span className="ml-auto text-[11px] text-navy-400">
            Showing <span className="font-bold text-navy-800">{filteredGroups.length}</span> groups
          </span>
        </div>
      </div>

      {/* Groups Table / List */}
      <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-navy-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            <span className="text-xs font-semibold">Loading Facebook Groups...</span>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="p-12 text-center text-navy-400 text-xs">
            <Facebook className="h-10 w-10 mx-auto text-navy-200 mb-2" />
            <p className="font-bold text-navy-700 text-sm">No Facebook Groups Found</p>
            <p className="mt-1">Add your target Lahore Facebook groups to begin marketing.</p>
            <button
              type="button"
              onClick={() => {
                setEditingGroup(null);
                setIsFormModalOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition"
            >
              Add First Facebook Group
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-navy-50/70 border-b border-navy-100 text-[11px] font-extrabold uppercase tracking-wider text-navy-400">
                  <th className="py-4 px-6">Group & Target Area</th>
                  <th className="py-4 px-4">Permissions</th>
                  <th className="py-4 px-4">Membership & Lang</th>
                  <th className="py-4 px-4">Cooldown Limits</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {filteredGroups.map((group) => (
                  <tr
                    key={group._id}
                    className="hover:bg-navy-50/50 transition cursor-pointer"
                    onClick={() => setDetailGroupId(group._id)}
                  >
                    {/* Group & Area */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-950 text-brand-400 shrink-0">
                          <Facebook className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-navy-950 text-sm hover:text-brand-600 transition">
                              {group.name}
                            </span>
                            <a
                              href={group.groupUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-navy-400 hover:text-brand-600"
                              title="Open in Facebook"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-navy-500 mt-0.5">
                            <span className="font-bold text-navy-800">{group.area}</span>
                            {group.subAreaFocus?.length > 0 && (
                              <span className="text-navy-400">
                                ({group.subAreaFocus.slice(0, 2).join(', ')})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* TWO INDEPENDENT PERMISSION SWITCHES (CRITICAL REQUIREMENT) */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            group.allowsWebsiteMarketing
                              ? 'bg-brand-50 text-brand-700 border border-brand-200'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Globe2 className="h-3 w-3" />
                          <span>Website: {group.allowsWebsiteMarketing ? 'Allowed' : 'Off'}</span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            group.allowsPropertyAdvertising
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Building className="h-3 w-3" />
                          <span>Property: {group.allowsPropertyAdvertising ? 'Allowed' : 'Off'}</span>
                        </span>
                      </div>
                    </td>

                    {/* Membership & Lang */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-navy-800 block">{group.membershipType}</span>
                      <span className="text-[11px] text-navy-500 block mt-0.5">
                        {group.preferredLanguage}
                      </span>
                    </td>

                    {/* Separate Cooldown Indicators */}
                    <td className="py-4 px-4">
                      <div className="text-[11px] text-navy-500 space-y-0.5">
                        <span className="block font-semibold">
                          Freq: {group.postingFrequencyLimitHours}h
                        </span>
                        {group.websiteMarketingLastPostedAt && (
                          <span className="block text-[10px] text-brand-700">
                            Web: {new Date(group.websiteMarketingLastPostedAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                          </span>
                        )}
                        {group.propertyMarketingLastPostedAt && (
                          <span className="block text-[10px] text-blue-700">
                            Prop: {new Date(group.propertyMarketingLastPostedAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(group);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition ${
                          group.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {group.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-gray-500" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          title="View Group Details & Cooldown"
                          onClick={() => setDetailGroupId(group._id)}
                          className="p-1.5 rounded-lg border border-navy-200 hover:bg-navy-100 text-navy-700 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Edit Group"
                          onClick={() => {
                            setEditingGroup(group);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-navy-200 hover:bg-navy-100 text-navy-700 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === group._id}
                          title="Delete Group"
                          onClick={() => handleDelete(group._id, group.name)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <GroupFormModal
        isOpen={isFormModalOpen}
        group={editingGroup}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingGroup(null);
        }}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          loadGroups();
        }}
      />

      {/* Group Detail Modal */}
      <GroupDetailModal
        groupId={detailGroupId}
        onClose={() => setDetailGroupId(null)}
        onEdit={(grp) => {
          setEditingGroup(grp);
          setIsFormModalOpen(true);
        }}
      />
    </div>
  );
}
