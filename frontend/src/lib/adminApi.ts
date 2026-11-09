import { ApiResponse, PropertyListing, EnquiryItem, NotificationItem, AnalyticsData, EnquiryStatus } from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface DashboardStatsData {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    sold: number;
    rented: number;
    expired: number;
    wanted: number;
  };
  enquiryStats?: {
    total: number;
    new: number;
    contacted: number;
    followUp: number;
    converted: number;
    closed: number;
  };
  recentSubmissions: any[];
  awaitingApproval: any[];
  recentActivity: any[];
  recentEnquiries?: EnquiryItem[];
  unreadNotificationsCount?: number;
}

export interface AdminPropertiesQuery {
  status?: string;
  listingType?: string;
  propertyType?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const adminLoginRequest = async (
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; data?: { admin: AdminUser } }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Sends & receives HttpOnly cookie
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    return json;
  } catch (err) {
    return {
      success: false,
      message: 'Failed to connect to authentication server. Please check backend connection.',
    };
  }
};

export const adminLogoutRequest = async (): Promise<{ success: boolean }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return await res.json();
  } catch {
    return { success: false };
  }
};

export const fetchAdminProfile = async (): Promise<AdminUser | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.admin || null;
  } catch {
    return null;
  }
};

export const fetchDashboardStats = async (): Promise<DashboardStatsData | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
};

export const fetchAdminProperties = async (
  query: AdminPropertiesQuery = {}
): Promise<{
  properties: any[];
  total: number;
  totalPages: number;
  page: number;
}> => {
  try {
    const params = new URLSearchParams();
    if (query.status && query.status !== 'ALL') params.set('status', query.status);
    if (query.listingType && query.listingType !== 'ALL') params.set('listingType', query.listingType);
    if (query.propertyType && query.propertyType !== 'ALL') params.set('propertyType', query.propertyType);
    if (query.search) params.set('search', query.search);
    if (query.sort) params.set('sort', query.sort);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const qs = params.toString();
    const res = await fetch(`${API_BASE_URL}/admin/properties${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) return { properties: [], total: 0, totalPages: 1, page: 1 };
    const json = await res.json();

    return {
      properties: json.data || [],
      total: json.pagination?.total || 0,
      totalPages: json.pagination?.totalPages || 1,
      page: json.pagination?.page || 1,
    };
  } catch {
    return { properties: [], total: 0, totalPages: 1, page: 1 };
  }
};

export const approvePropertyRequest = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/properties/${id}/approve`, {
      method: 'PATCH',
      credentials: 'include',
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
};

export const rejectPropertyRequest = async (id: string, reason: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/properties/${id}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
};

export const changePropertyStatusRequest = async (id: string, status: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/properties/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
};

export const toggleFeaturePropertyRequest = async (id: string, isFeatured: boolean): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/properties/${id}/feature`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isFeatured }),
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
};

export const updateAdminPropertyRequest = async (id: string, payload: any): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
};

export const deleteAdminPropertyRequest = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/properties/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
};

export const fetchAuditLogs = async (
  page: number = 1
): Promise<{ logs: any[]; total: number; totalPages: number }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs?page=${page}&limit=20`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) return { logs: [], total: 0, totalPages: 1 };
    const json = await res.json();

    return {
      logs: json.data || [],
      total: json.pagination?.total || 0,
      totalPages: json.pagination?.totalPages || 1,
    };
  } catch {
    return { logs: [], total: 0, totalPages: 1 };
  }
};

export interface AdminEnquiriesQuery {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetches lead enquiries for the admin portal.
 */
export const fetchAdminEnquiries = async (
  query: AdminEnquiriesQuery = {}
): Promise<{
  enquiries: EnquiryItem[];
  total: number;
  totalPages: number;
  page: number;
}> => {
  try {
    const params = new URLSearchParams();
    if (query.status && query.status !== 'ALL') params.append('status', query.status);
    if (query.search) params.append('search', query.search);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const res = await fetch(`${API_BASE_URL}/admin/enquiries?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) return { enquiries: [], total: 0, totalPages: 1, page: 1 };
    const json = await res.json();

    return {
      enquiries: json.data?.enquiries || [],
      total: json.data?.total || 0,
      totalPages: json.data?.totalPages || 1,
      page: json.data?.page || 1,
    };
  } catch {
    return { enquiries: [], total: 0, totalPages: 1, page: 1 };
  }
};

/**
 * Updates enquiry status.
 */
export const updateEnquiryStatusRequest = async (
  id: string,
  status: EnquiryStatus
): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/enquiries/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
};

/**
 * Updates internal administrator notes for an enquiry.
 */
export const updateEnquiryNotesRequest = async (
  id: string,
  notes: string
): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/enquiries/${id}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ notes }),
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
};

/**
 * Deletes an enquiry.
 */
export const deleteEnquiryRequest = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/enquiries/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
};

/**
 * Fetches admin in-app notifications and unread counter.
 */
export const fetchAdminNotifications = async (): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/notifications`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) return { notifications: [], unreadCount: 0 };
    const json = await res.json();

    return {
      notifications: json.data?.notifications || [],
      unreadCount: json.data?.unreadCount || 0,
    };
  } catch {
    return { notifications: [], unreadCount: 0 };
  }
};

/**
 * Marks a single notification as read.
 */
export const markNotificationReadRequest = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include',
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
};

/**
 * Marks all notifications as read.
 */
export const markAllNotificationsReadRequest = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/notifications/mark-all-read`, {
      method: 'POST',
      credentials: 'include',
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
};

/**
 * Fetches comprehensive admin analytics.
 */
export const fetchAdminAnalytics = async (): Promise<AnalyticsData | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
};
