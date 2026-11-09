'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Settings,
  Sparkles,
  Globe2,
  Building,
  RotateCw,
  CheckCircle2,
  ShieldAlert,
  Play,
  Save,
  Languages,
  Phone,
  Tag,
  AlertCircle,
} from 'lucide-react';
import {
  MarketingSettingsData,
  fetchMarketingSettings,
  updateMarketingSettings,
  FacebookGroupItem,
  fetchFacebookGroups,
  triggerWebsiteCampaignRun,
  triggerPropertyCampaignRun,
} from '@/lib/marketingApi';
import MarketingNav from '@/components/admin/marketing/MarketingNav';

const THEMES = [
  { id: 'FREE_PROPERTY_LISTINGS', name: 'Free Property Listing Advantage', desc: 'Promotes 100% free advertising for property owners in Lahore.' },
  { id: 'LANDLORD_RENTAL', name: 'Landlord & Rental Discovery', desc: 'Targets landlords looking for verified family tenants.' },
  { id: 'DEALER_PARTNERSHIPS', name: 'Real Estate Dealer Network', desc: 'Invites Lahore property agents to publish their inventory.' },
  { id: 'BUYER_DISCOVERY', name: 'Verified Buyer Inquiries', desc: 'Attracts active buyers searching for plots and houses.' },
  { id: 'TENANT_DISCOVERY', name: 'Direct Tenant Connections', desc: 'Connects tenants with zero commission brokerage traps.' },
  { id: 'SOCIETY_SPOTLIGHT', name: 'Society Area Spotlight', desc: 'Focuses on Bahria Town, DHA, Johar Town & Lake City.' },
];

export default function MarketingPlannerPage() {
  const [settings, setSettings] = useState<MarketingSettingsData | null>(null);
  const [groups, setGroups] = useState<FacebookGroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Editable settings fields
  const [dailyGenerationTime, setDailyGenerationTime] = useState('10:00');
  const [enableWebsiteMarketing, setEnableWebsiteMarketing] = useState(true);
  const [enablePropertyMarketing, setEnablePropertyMarketing] = useState(true);
  const [dailyWebsitePostCap, setDailyWebsitePostCap] = useState(6);
  const [brandWhatsAppNumber, setBrandWhatsAppNumber] = useState('+923001234567');
  const [preferredAiTone, setPreferredAiTone] = useState<'PERSUASIVE' | 'PROFESSIONAL' | 'URGENT'>('PERSUASIVE');
  const [languagePreferences, setLanguagePreferences] = useState<string[]>(['ROMAN_URDU', 'URDU', 'ENGLISH']);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      const [settingsRes, groupsRes] = await Promise.all([
        fetchMarketingSettings(),
        fetchFacebookGroups({ active: true, limit: 100 }),
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
        setDailyGenerationTime(settingsRes.data.dailyGenerationTime || '10:00');
        setEnableWebsiteMarketing(settingsRes.data.enableWebsiteMarketing !== false);
        setEnablePropertyMarketing(settingsRes.data.enablePropertyMarketing !== false);
        setDailyWebsitePostCap(settingsRes.data.dailyWebsitePostCap || 6);
        setBrandWhatsAppNumber(settingsRes.data.brandWhatsAppNumber || '+923001234567');
        setPreferredAiTone(settingsRes.data.preferredAiTone || 'PERSUASIVE');
        setLanguagePreferences(
          settingsRes.data.languagePreferences?.length
            ? settingsRes.data.languagePreferences
            : ['ROMAN_URDU', 'URDU', 'ENGLISH']
        );
      }

      if (groupsRes.success && groupsRes.data) {
        setGroups(groupsRes.data);
      }
    } catch {
      showToast('Error loading marketing planner data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateMarketingSettings({
        dailyGenerationTime,
        enableWebsiteMarketing,
        enablePropertyMarketing,
        dailyWebsitePostCap: Number(dailyWebsitePostCap),
        brandWhatsAppNumber: brandWhatsAppNumber.trim(),
        preferredAiTone,
        languagePreferences,
      });

      if (res.success) {
        showToast('Marketing settings saved successfully.', 'success');
      } else {
        showToast(res.message || 'Failed to update settings.', 'error');
      }
    } catch {
      showToast('Network error saving settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleManualRunWebsite = async () => {
    setGenerating(true);
    try {
      const res = await triggerWebsiteCampaignRun();
      if (res.success) {
        showToast(res.message || 'Engine 1 generated daily campaigns into approval queue!', 'success');
      } else {
        showToast(res.message || 'Execution halted.', 'error');
      }
    } catch {
      showToast('Network error during campaign generation.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (languagePreferences.includes(lang)) {
      if (languagePreferences.length === 1) {
        showToast('At least one language preference is required.', 'error');
        return;
      }
      setLanguagePreferences(languagePreferences.filter((l) => l !== lang));
    } else {
      setLanguagePreferences([...languagePreferences, lang]);
    }
  };

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
            Daily Campaign Planner & Automation Rules
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Configure generation schedule, rotate marketing themes, and review group cooldown cycles.
          </p>
        </div>

        <button
          type="button"
          disabled={generating}
          onClick={handleManualRunWebsite}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-sm disabled:opacity-50"
        >
          {generating ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin" />
              <span>Generating Campaigns...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Generate Daily Campaign Now</span>
            </>
          )}
        </button>
      </div>

      {/* Sub Nav */}
      <MarketingNav />

      {/* Strict Compliance Reminder Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold text-amber-950">
            Strict Policy: No Automated Facebook Publishing
          </p>
          <p className="mt-0.5 leading-relaxed text-amber-800">
            Campaign generation creates drafts strictly into the <span className="font-bold">Pending Approval</span> queue.
            Neither the schedule nor the AI agent will ever post directly or use browser automation.
            All Facebook publications must be manually executed and confirmed by the administrator.
          </p>
        </div>
      </div>

      {/* Settings & Themes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Configuration (1 col) */}
        <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-brand-600" />
              <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider">
                Planner Engine Settings
              </h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Daily Generation Time */}
              <div>
                <label className="block text-xs font-bold text-navy-800 mb-1">
                  Daily Generation Schedule (PKT)
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-navy-400" />
                  <input
                    type="time"
                    value={dailyGenerationTime}
                    onChange={(e) => setDailyGenerationTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 font-bold bg-navy-50/50"
                  />
                </div>
              </div>

              {/* Engine 1 Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-navy-50 border border-navy-100">
                <div>
                  <span className="text-xs font-bold text-navy-900 block">Website Marketing</span>
                  <span className="text-[10px] text-navy-500">Enable daily brand generation</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableWebsiteMarketing}
                  onChange={(e) => setEnableWebsiteMarketing(e.target.checked)}
                  className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                />
              </div>

              {/* Engine 2 Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-navy-50 border border-navy-100">
                <div>
                  <span className="text-xs font-bold text-navy-900 block">Property Marketing</span>
                  <span className="text-[10px] text-navy-500">Auto-trigger on property approval</span>
                </div>
                <input
                  type="checkbox"
                  checked={enablePropertyMarketing}
                  onChange={(e) => setEnablePropertyMarketing(e.target.checked)}
                  className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                />
              </div>

              {/* Daily Post Cap */}
              <div>
                <label className="block text-xs font-bold text-navy-800 mb-1">
                  Daily Website Campaign Cap
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={dailyWebsitePostCap}
                  onChange={(e) => setDailyWebsitePostCap(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 bg-white"
                />
              </div>

              {/* WhatsApp Contact */}
              <div>
                <label className="block text-xs font-bold text-navy-800 mb-1">
                  Brand WhatsApp Contact
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-navy-400" />
                  <input
                    type="text"
                    value={brandWhatsAppNumber}
                    onChange={(e) => setBrandWhatsAppNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 bg-white"
                  />
                </div>
              </div>

              {/* AI Copy Tone */}
              <div>
                <label className="block text-xs font-bold text-navy-800 mb-1">
                  AI Marketing Tone
                </label>
                <select
                  value={preferredAiTone}
                  onChange={(e) => setPreferredAiTone(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 bg-white"
                >
                  <option value="PERSUASIVE">Persuasive (High engagement & call to action)</option>
                  <option value="PROFESSIONAL">Professional (Corporate & direct)</option>
                  <option value="URGENT">Urgent (Limited opportunity & speed)</option>
                </select>
              </div>

              {/* Language Preferences */}
              <div>
                <label className="block text-xs font-bold text-navy-800 mb-2">
                  Campaign Language Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {['ROMAN_URDU', 'URDU', 'ENGLISH'].map((lang) => {
                    const isSelected = languagePreferences.includes(lang);
                    return (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                          isSelected
                            ? 'bg-navy-950 text-white border-navy-950'
                            : 'bg-white text-navy-600 border-navy-200 hover:border-navy-300'
                        }`}
                      >
                        {lang === 'ROMAN_URDU' ? 'Roman Urdu' : lang === 'URDU' ? 'اردو' : 'English'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 transition shadow-sm disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving Settings...' : 'Save Planner Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 6 Rotating Campaign Themes (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-brand-600" />
              <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider">
                6 Rotating Marketing Themes (Engine 1)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {THEMES.map((theme, i) => (
                <div
                  key={theme.id}
                  className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 hover:border-brand-200 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-navy-900 text-brand-400 font-extrabold text-[10px]">
                      {i + 1}
                    </span>
                    <h4 className="text-xs font-extrabold text-navy-950">{theme.name}</h4>
                  </div>
                  <p className="text-[11px] text-navy-500 mt-2 leading-relaxed">{theme.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Group Cooldown Monitor Table */}
          <div className="bg-white rounded-3xl border border-navy-100 shadow-subtle p-6">
            <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider mb-4">
              Group Cooldown Status Overview ({groups.length} Active Groups)
            </h3>

            {groups.length === 0 ? (
              <div className="p-8 text-center text-navy-400 text-xs border border-dashed border-navy-200 rounded-2xl">
                No active Facebook groups registered.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-navy-100 text-[10px] font-extrabold uppercase text-navy-400">
                      <th className="pb-3">Facebook Group</th>
                      <th className="pb-3">Area</th>
                      <th className="pb-3">Website Marketing</th>
                      <th className="pb-3">Property Marketing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {groups.slice(0, 8).map((g) => (
                      <tr key={g._id} className="py-2.5">
                        <td className="py-2.5 font-bold text-navy-900 truncate max-w-[180px]">
                          {g.name}
                        </td>
                        <td className="py-2.5 text-navy-600">{g.area}</td>
                        <td className="py-2.5">
                          {g.allowsWebsiteMarketing ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Eligible (24h cooldown)
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">Disabled</span>
                          )}
                        </td>
                        <td className="py-2.5">
                          {g.allowsPropertyAdvertising ? (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              Eligible (24h cooldown)
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">Disabled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
