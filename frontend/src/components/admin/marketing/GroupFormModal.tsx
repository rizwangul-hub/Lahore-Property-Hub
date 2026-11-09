'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Facebook,
  Globe,
  Building2,
  Clock,
  Languages,
  Shield,
  FileText,
  AlertCircle,
  Check,
} from 'lucide-react';
import {
  FacebookGroupItem,
  createFacebookGroup,
  updateFacebookGroup,
} from '@/lib/marketingApi';

const LAHORE_AREAS = [
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
  'Faisal Town',
  'Garden Town',
  'Iqbal Town',
];

const CATEGORIES = ['ALL', 'HOUSE', 'PLOT', 'APARTMENT', 'COMMERCIAL', 'OFFICE', 'SHOP'];

interface GroupFormModalProps {
  isOpen: boolean;
  group: FacebookGroupItem | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function GroupFormModal({
  isOpen,
  group,
  onClose,
  onSuccess,
}: GroupFormModalProps) {
  const isEditing = Boolean(group);

  const [name, setName] = useState('');
  const [groupUrl, setGroupUrl] = useState('');
  const [area, setArea] = useState('All Lahore');
  const [customArea, setCustomArea] = useState('');
  const [subAreaInput, setSubAreaInput] = useState('');
  const [subAreaFocus, setSubAreaFocus] = useState<string[]>([]);
  const [groupRules, setGroupRules] = useState('');
  const [membershipType, setMembershipType] = useState<'MEMBER' | 'MODERATOR' | 'ADMIN'>('MEMBER');
  const [acceptedCategories, setAcceptedCategories] = useState<string[]>(['ALL']);
  const [allowsWebsiteMarketing, setAllowsWebsiteMarketing] = useState(true);
  const [allowsPropertyAdvertising, setAllowsPropertyAdvertising] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState<'ROMAN_URDU' | 'URDU' | 'ENGLISH' | 'BILINGUAL'>('ROMAN_URDU');
  const [postingFrequencyLimitHours, setPostingFrequencyLimitHours] = useState(24);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setGroupUrl(group.groupUrl || '');
      if (LAHORE_AREAS.includes(group.area)) {
        setArea(group.area);
        setCustomArea('');
      } else {
        setArea('OTHER');
        setCustomArea(group.area || '');
      }
      setSubAreaFocus(group.subAreaFocus || []);
      setGroupRules(group.groupRules || '');
      setMembershipType(group.membershipType || 'MEMBER');
      setAcceptedCategories(group.acceptedCategories?.length ? group.acceptedCategories : ['ALL']);
      setAllowsWebsiteMarketing(group.allowsWebsiteMarketing !== false);
      setAllowsPropertyAdvertising(group.allowsPropertyAdvertising !== false);
      setPreferredLanguage(group.preferredLanguage || 'ROMAN_URDU');
      setPostingFrequencyLimitHours(group.postingFrequencyLimitHours || 24);
      setIsActive(group.isActive !== false);
      setNotes(group.notes || '');
    } else {
      setName('');
      setGroupUrl('');
      setArea('All Lahore');
      setCustomArea('');
      setSubAreaFocus([]);
      setGroupRules('');
      setMembershipType('MEMBER');
      setAcceptedCategories(['ALL']);
      setAllowsWebsiteMarketing(true);
      setAllowsPropertyAdvertising(true);
      setPreferredLanguage('ROMAN_URDU');
      setPostingFrequencyLimitHours(24);
      setIsActive(true);
      setNotes('');
    }
    setError(null);
  }, [group, isOpen]);

  if (!isOpen) return null;

  const handleAddSubArea = () => {
    if (subAreaInput.trim() && !subAreaFocus.includes(subAreaInput.trim())) {
      setSubAreaFocus([...subAreaFocus, subAreaInput.trim()]);
      setSubAreaInput('');
    }
  };

  const handleRemoveSubArea = (tag: string) => {
    setSubAreaFocus(subAreaFocus.filter((t) => t !== tag));
  };

  const toggleCategory = (cat: string) => {
    if (cat === 'ALL') {
      setAcceptedCategories(['ALL']);
      return;
    }
    const filtered = acceptedCategories.filter((c) => c !== 'ALL');
    if (filtered.includes(cat)) {
      const next = filtered.filter((c) => c !== cat);
      setAcceptedCategories(next.length ? next : ['ALL']);
    } else {
      setAcceptedCategories([...filtered, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalArea = area === 'OTHER' ? customArea.trim() : area;

    if (!name.trim()) {
      setError('Please provide a Facebook group name.');
      return;
    }
    if (!groupUrl.trim() || !/^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+/i.test(groupUrl.trim())) {
      setError('Please provide a valid Facebook group URL (e.g. https://facebook.com/groups/yourgroup).');
      return;
    }
    if (!finalArea) {
      setError('Please specify the Lahore area or society.');
      return;
    }

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      groupUrl: groupUrl.trim(),
      area: finalArea,
      subAreaFocus,
      groupRules: groupRules.trim(),
      membershipType,
      acceptedCategories,
      allowsWebsiteMarketing,
      allowsPropertyAdvertising,
      preferredLanguage,
      postingFrequencyLimitHours: Number(postingFrequencyLimitHours) || 24,
      isActive,
      notes: notes.trim(),
    };

    try {
      const res = isEditing && group
        ? await updateFacebookGroup(group._id, payload)
        : await createFacebookGroup(payload);

      if (res.success) {
        onSuccess(
          isEditing
            ? `Updated "${payload.name}" successfully.`
            : `Added "${payload.name}" to marketing directory.`
        );
        onClose();
      } else {
        setError(res.message || 'Server rejected the request.');
      }
    } catch {
      setError('Network communication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-navy-100 overflow-hidden my-8 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy-100 bg-navy-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-950 text-brand-400">
              <Facebook className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy-950">
                {isEditing ? 'Edit Facebook Group' : 'Add Facebook Group'}
              </h3>
              <p className="text-xs text-navy-500">
                Configure campaign permissions, cooldowns, and Lahore targeting
              </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Group Name & URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bahria Town Lahore Property Club"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Facebook Group URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={groupUrl}
                onChange={(e) => setGroupUrl(e.target.value)}
                placeholder="https://facebook.com/groups/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>
          </div>

          {/* Area & Sub-area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Target Lahore Area <span className="text-red-500">*</span>
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {LAHORE_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
                <option value="OTHER">Other / Custom Society...</option>
              </select>

              {area === 'OTHER' && (
                <input
                  type="text"
                  required
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  placeholder="Enter custom society/area name"
                  className="w-full mt-2 px-3.5 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Sub-area Focus (Blocks, Sectors, Phases)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subAreaInput}
                  onChange={(e) => setSubAreaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubArea();
                    }
                  }}
                  placeholder="e.g. Sector C, Phase 5"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddSubArea}
                  className="px-3 py-2 bg-navy-100 hover:bg-navy-200 text-navy-800 text-xs font-bold rounded-xl transition"
                >
                  Add
                </button>
              </div>

              {subAreaFocus.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {subAreaFocus.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-700 text-[11px] font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubArea(tag)}
                        className="text-navy-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TWO INDEPENDENT PERMISSION SWITCHES (CRITICAL REQUIREMENT) */}
          <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200 space-y-3">
            <span className="text-xs font-extrabold text-navy-950 uppercase tracking-wider block">
              Independent Campaign Permissions
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-brand-100 cursor-pointer shadow-subtle hover:border-brand-300 transition">
                <input
                  type="checkbox"
                  checked={allowsWebsiteMarketing}
                  onChange={(e) => setAllowsWebsiteMarketing(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-navy-900 block">
                    Allow Website Marketing
                  </span>
                  <span className="text-[11px] text-navy-500">
                    Engine 1 can target this group with daily brand & free listing promotional posts.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-brand-100 cursor-pointer shadow-subtle hover:border-brand-300 transition">
                <input
                  type="checkbox"
                  checked={allowsPropertyAdvertising}
                  onChange={(e) => setAllowsPropertyAdvertising(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-navy-900 block">
                    Allow Property Advertising
                  </span>
                  <span className="text-[11px] text-navy-500">
                    Engine 2 can generate individual approved property ads matching this location.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Membership Type, Language, Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Membership Type
              </label>
              <select
                value={membershipType}
                onChange={(e) => setMembershipType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="MEMBER">Ordinary Member</option>
                <option value="MODERATOR">Group Moderator</option>
                <option value="ADMIN">Group Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="ROMAN_URDU">Roman Urdu (Urdu in English letters)</option>
                <option value="URDU">Urdu Script (اردو)</option>
                <option value="ENGLISH">English</option>
                <option value="BILINGUAL">Bilingual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Cooldown Limit (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={168}
                value={postingFrequencyLimitHours}
                onChange={(e) => setPostingFrequencyLimitHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>
          </div>

          {/* Accepted Property Categories */}
          <div>
            <label className="block text-xs font-bold text-navy-800 mb-2">
              Accepted Property Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = acceptedCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      isSelected
                        ? 'bg-navy-950 text-white border-navy-950'
                        : 'bg-white text-navy-600 border-navy-200 hover:border-navy-300'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group Rules & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Group Rules (e.g. No Price = Delete, Max 1 post/day)
              </label>
              <textarea
                rows={3}
                value={groupRules}
                onChange={(e) => setGroupRules(e.target.value)}
                placeholder="Paste key group rules here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Internal Administrative Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes regarding posting times, admin contact, etc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-navy-50 border border-navy-100">
            <div>
              <span className="text-xs font-bold text-navy-900 block">Group Active Status</span>
              <span className="text-[11px] text-navy-500">
                Inactive groups are excluded from all campaign generation cycles.
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-navy-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-navy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-navy-200 text-navy-700 font-bold text-xs hover:bg-navy-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Group' : 'Add Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
