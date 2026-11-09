const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export type CampaignType = 'WEBSITE_MARKETING' | 'PROPERTY_MARKETING';
export type DraftStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'SKIPPED'
  | 'CANCELLED_PROPERTY_UNAVAILABLE';
export type GroupMembershipType = 'MEMBER' | 'MODERATOR' | 'ADMIN';
export type PreferredLanguage = 'ENGLISH' | 'URDU' | 'ROMAN_URDU' | 'BILINGUAL';

export interface FacebookGroupItem {
  _id: string;
  name: string;
  groupUrl: string;
  area: string;
  subAreaFocus: string[];
  groupRules?: string;
  membershipType: GroupMembershipType;
  acceptedCategories: string[];
  allowsWebsiteMarketing: boolean;
  allowsPropertyAdvertising: boolean;
  preferredLanguage: PreferredLanguage;
  postingFrequencyLimitHours: number;
  websiteMarketingLastPostedAt?: string | null;
  propertyMarketingLastPostedAt?: string | null;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  totalCampaigns?: number;
  totalConfirmed?: number;
  recentHistory?: PostingHistoryItem[];
  cooldown?: {
    isWebsiteInCooldown: boolean;
    nextEligibleWebsite: string | null;
    isPropertyInCooldown: boolean;
    nextEligibleProperty: string | null;
  };
}

export interface MarketingDraftItem {
  _id: string;
  campaignType: CampaignType;
  propertyId?: string;
  propertySlug?: string;
  propertyReferenceId?: string;
  groupId: string;
  groupName: string;
  targetArea: string;
  language: PreferredLanguage;
  theme?: string;
  headline: string;
  caption: string;
  hashtags: string[];
  imageUrls: string[];
  targetUrl: string;
  status: DraftStatus;
  approvedAt?: string;
  rejectedAt?: string;
  publishedAt?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  facebookPostUrl?: string;
  livePropertyStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostingHistoryItem {
  _id: string;
  draftId: string;
  campaignType: CampaignType;
  propertyId?: string;
  groupId: string;
  groupName: string;
  postedAt: string;
  facebookPostUrl: string;
  language: PreferredLanguage;
  status: 'CONFIRMED' | 'FLAGGED' | 'REMOVED';
  adminEmail?: string;
  notes?: string;
  createdAt: string;
}

export interface MarketingSettingsData {
  officialWebsiteUrl: string;
  brandWhatsAppNumber: string;
  defaultHashtags: string[];
  autoEngine2OnApproval: boolean;
  dailyWebsitePostCap: number;
  dailyGenerationTime: string;
  enableWebsiteMarketing: boolean;
  enablePropertyMarketing: boolean;
  languagePreferences: string[];
  defaultBannerUrls: string[];
  preferredAiTone: 'PERSUASIVE' | 'PROFESSIONAL' | 'URGENT';
  updatedAt: string;
}

export interface MarketingStatsData {
  totalActiveGroups: number;
  websiteMarketingGroups: number;
  propertyMarketingGroups: number;
  todayWebsiteDrafts: number;
  newPropertyDrafts: number;
  pendingApprovals: number;
  approvedDrafts: number;
  publishedPosts: number;
  cancelledDrafts: number;
  approvedPropertiesCount: number;
  engine1: {
    status: string;
    todayGenerated: number;
    eligibleGroups: number;
    lastRunAt: string | null;
    lastTheme: string | null;
  };
  engine2: {
    status: string;
    approvedPropertiesDetected: number;
    matchingGroups: number;
    generatedDrafts: number;
    pendingApprovals: number;
    cancelledDrafts: number;
    lastRunAt: string | null;
  };
}

export interface MarketingApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const safeFetch = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<MarketingApiResponse<T>> => {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const json = await res.json().catch(() => ({
      success: false,
      message: `HTTP ${res.status}: Failed to parse server response.`,
    }));

    if (!res.ok) {
      return {
        success: false,
        message: json.message || `Server returned error (${res.status})`,
        data: json.data,
      };
    }

    return json;
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network connection failed. Backend is unreachable.',
    };
  }
};

// 1. STATS
export const fetchMarketingStats = async (): Promise<MarketingApiResponse<MarketingStatsData>> => {
  return safeFetch<MarketingStatsData>(`${API_BASE_URL}/marketing/stats`);
};

// 2. FACEBOOK GROUPS
export const fetchFacebookGroups = async (params: {
  area?: string;
  active?: boolean;
  allowsWebsite?: boolean;
  allowsProperty?: boolean;
  page?: number;
  limit?: number;
} = {}): Promise<MarketingApiResponse<FacebookGroupItem[]>> => {
  const query = new URLSearchParams();
  if (params.area) query.set('area', params.area);
  if (params.active !== undefined) query.set('active', String(params.active));
  if (params.allowsWebsite) query.set('allowsWebsite', 'true');
  if (params.allowsProperty) query.set('allowsProperty', 'true');
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  return safeFetch<FacebookGroupItem[]>(`${API_BASE_URL}/marketing/groups?${query.toString()}`);
};

export const fetchFacebookGroupById = async (
  id: string
): Promise<MarketingApiResponse<FacebookGroupItem>> => {
  return safeFetch<FacebookGroupItem>(`${API_BASE_URL}/marketing/groups/${id}`);
};

export const createFacebookGroup = async (
  payload: Partial<FacebookGroupItem>
): Promise<MarketingApiResponse<FacebookGroupItem>> => {
  return safeFetch<FacebookGroupItem>(`${API_BASE_URL}/marketing/groups`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateFacebookGroup = async (
  id: string,
  payload: Partial<FacebookGroupItem>
): Promise<MarketingApiResponse<FacebookGroupItem>> => {
  return safeFetch<FacebookGroupItem>(`${API_BASE_URL}/marketing/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteFacebookGroup = async (
  id: string
): Promise<MarketingApiResponse<void>> => {
  return safeFetch<void>(`${API_BASE_URL}/marketing/groups/${id}`, {
    method: 'DELETE',
  });
};

// 3. MARKETING DRAFTS & QUEUE
export const fetchMarketingDrafts = async (params: {
  campaignType?: string;
  status?: string;
  groupId?: string;
  propertyId?: string;
  page?: number;
  limit?: number;
} = {}): Promise<MarketingApiResponse<MarketingDraftItem[]>> => {
  const query = new URLSearchParams();
  if (params.campaignType) query.set('campaignType', params.campaignType);
  if (params.status) query.set('status', params.status);
  if (params.groupId) query.set('groupId', params.groupId);
  if (params.propertyId) query.set('propertyId', params.propertyId);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  return safeFetch<MarketingDraftItem[]>(`${API_BASE_URL}/marketing/drafts?${query.toString()}`);
};

export const fetchMarketingDraftById = async (
  id: string
): Promise<MarketingApiResponse<MarketingDraftItem>> => {
  return safeFetch<MarketingDraftItem>(`${API_BASE_URL}/marketing/drafts/${id}`);
};

export const updateMarketingDraft = async (
  id: string,
  payload: { headline?: string; caption?: string; hashtags?: string[]; imageUrls?: string[] }
): Promise<MarketingApiResponse<MarketingDraftItem>> => {
  return safeFetch<MarketingDraftItem>(`${API_BASE_URL}/marketing/drafts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const regenerateMarketingDraft = async (
  id: string
): Promise<MarketingApiResponse<MarketingDraftItem>> => {
  return safeFetch<MarketingDraftItem>(`${API_BASE_URL}/marketing/drafts/${id}/regenerate`, {
    method: 'POST',
  });
};

export const approveMarketingDraft = async (
  id: string
): Promise<MarketingApiResponse<MarketingDraftItem>> => {
  return safeFetch<MarketingDraftItem>(`${API_BASE_URL}/marketing/drafts/${id}/approve`, {
    method: 'POST',
  });
};

export const rejectMarketingDraft = async (
  id: string,
  reason?: string
): Promise<MarketingApiResponse<MarketingDraftItem>> => {
  return safeFetch<MarketingDraftItem>(`${API_BASE_URL}/marketing/drafts/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const skipMarketingDraft = async (
  id: string
): Promise<MarketingApiResponse<MarketingDraftItem>> => {
  return safeFetch<MarketingDraftItem>(`${API_BASE_URL}/marketing/drafts/${id}/skip`, {
    method: 'POST',
  });
};

// 4. PUBLISHING CONFIRMATION
export const confirmDraftPublished = async (
  id: string,
  payload: { facebookPostUrl: string; notes?: string; publicationDate?: string }
): Promise<MarketingApiResponse<{ draft: MarketingDraftItem; history: PostingHistoryItem }>> => {
  return safeFetch<{ draft: MarketingDraftItem; history: PostingHistoryItem }>(
    `${API_BASE_URL}/marketing/drafts/${id}/confirm-published`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
};

// 5. CAMPAIGN GENERATOR RUNNERS
export const triggerWebsiteCampaignRun = async (): Promise<MarketingApiResponse<any>> => {
  return safeFetch<any>(`${API_BASE_URL}/marketing/campaigns/generate-website`, {
    method: 'POST',
  });
};

export const triggerPropertyCampaignRun = async (
  propertyId?: string
): Promise<MarketingApiResponse<any>> => {
  return safeFetch<any>(`${API_BASE_URL}/marketing/campaigns/process-properties`, {
    method: 'POST',
    body: JSON.stringify({ propertyId }),
  });
};

// 6. HISTORY & SETTINGS
export const fetchPostingHistory = async (params: {
  campaignType?: string;
  groupId?: string;
  page?: number;
  limit?: number;
} = {}): Promise<MarketingApiResponse<PostingHistoryItem[]>> => {
  const query = new URLSearchParams();
  if (params.campaignType) query.set('campaignType', params.campaignType);
  if (params.groupId) query.set('groupId', params.groupId);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  return safeFetch<PostingHistoryItem[]>(`${API_BASE_URL}/marketing/history?${query.toString()}`);
};

export const fetchMarketingSettings = async (): Promise<MarketingApiResponse<MarketingSettingsData>> => {
  return safeFetch<MarketingSettingsData>(`${API_BASE_URL}/marketing/settings`);
};

export const updateMarketingSettings = async (
  payload: Partial<MarketingSettingsData>
): Promise<MarketingApiResponse<MarketingSettingsData>> => {
  return safeFetch<MarketingSettingsData>(`${API_BASE_URL}/marketing/settings`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};
