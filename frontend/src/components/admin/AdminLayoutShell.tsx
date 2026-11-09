'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Layers,
  Settings,
  MessageSquare,
  BarChart3,
  Bell,
  Megaphone,
} from 'lucide-react';
import {
  fetchAdminProfile,
  adminLogoutRequest,
  fetchAdminNotifications,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
  AdminUser,
} from '@/lib/adminApi';
import { NotificationItem } from '@/types';

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // In-App Notification System State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const isLoginPage = pathname === '/admin/login';

  // Check Admin Authentication
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (isLoginPage) {
        setLoading(false);
        return;
      }

      const currentAdmin = await fetchAdminProfile();
      if (!isMounted) return;

      if (!currentAdmin) {
        router.replace('/admin/login');
      } else {
        setAdmin(currentAdmin);
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // Load and poll notifications
  const loadNotifications = async () => {
    if (isLoginPage) return;
    try {
      const res = await fetchAdminNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // Silently catch
    }
  };

  useEffect(() => {
    if (isLoginPage) return;

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s background poll

    return () => clearInterval(interval);
  }, [isLoginPage]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await adminLogoutRequest();
    router.replace('/admin/login');
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markNotificationReadRequest(notif._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setNotifDropdownOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadRequest();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <span className="text-xs font-semibold tracking-wider text-navy-300">
            Verifying Admin Credentials...
          </span>
        </div>
      </div>
    );
  }

  const NAV_ITEMS = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Pending Moderation', href: '/admin/properties/pending', icon: Clock },
    { label: 'Approved Properties', href: '/admin/properties/approved', icon: CheckCircle2 },
    { label: 'Rejected Properties', href: '/admin/properties/rejected', icon: XCircle },
    { label: 'All Properties', href: '/admin/properties', icon: Layers },
    { label: 'Marketing AI Agent', href: '/admin/marketing', icon: Megaphone },
    { label: 'Lead Enquiries', href: '/admin/enquiries', icon: MessageSquare },
    { label: 'Market Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-navy-50/70 text-navy-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-950 text-white border-r border-navy-800 shrink-0 select-none">
        {/* Brand */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-navy-800/80">
          <Image
            src="/logo.jpg"
            alt="Property in Lahore"
            width={2400}
            height={1792}
            sizes="192px"
            className="h-auto w-[92px] rounded shadow-[0_0_22px_rgba(0,168,45,0.15)]"
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
            Admin Portal
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" aria-label="Admin Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-navy-300 hover:bg-navy-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-navy-800/80 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-brand-400 font-bold text-xs">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{admin?.name}</div>
              <div className="text-[10px] text-brand-400 font-semibold">{admin?.role}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 hover:bg-red-950/40 text-navy-300 hover:text-red-400 border border-navy-800 px-3 py-2 text-xs font-semibold transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-navy-100 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-navy-700 hover:bg-navy-100"
              aria-label="Open mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-navy-400">
              Administrative Control Panel
            </span>
            <Image
              src="/logo.jpg"
              alt="Property in Lahore"
              width={2400}
              height={1792}
              sizes="88px"
              className="h-auto w-[68px] rounded"
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl border border-navy-200 bg-white text-navy-700 hover:bg-navy-50 transition shadow-subtle"
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-extrabold text-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Popover */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-navy-100 bg-white shadow-2xl overflow-hidden animate-scale-up">
                  <div className="flex items-center justify-between px-4 py-3 bg-navy-50/70 border-b border-navy-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-brand-600 hover:text-brand-800 transition"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-navy-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-navy-400">
                        No notifications recorded.
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isProperty = notif.type === 'PROPERTY_SUBMITTED';
                        const isEnquiry = notif.type === 'ENQUIRY_RECEIVED';

                        return (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3.5 text-xs cursor-pointer hover:bg-navy-50/70 transition flex items-start gap-3 ${
                              !notif.isRead ? 'bg-brand-50/30' : ''
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                                isProperty
                                  ? 'bg-blue-100 text-blue-700'
                                  : isEnquiry
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {isProperty && <Building2 className="h-4 w-4" />}
                              {isEnquiry && <MessageSquare className="h-4 w-4" />}
                              {!isProperty && !isEnquiry && <Bell className="h-4 w-4" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-navy-900 truncate">
                                  {notif.title}
                                </span>
                                {!notif.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-brand-600 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-navy-600 line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>
                              <span className="text-[9px] text-navy-400 mt-1 inline-block">
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Public Website Link */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-3 py-1.5 text-xs font-bold text-navy-700 hover:bg-navy-50 transition shadow-subtle"
            >
              <ExternalLink className="h-3.5 w-3.5 text-brand-600" />
              <span>Public Website</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs text-navy-600 border-l border-navy-100 pl-4">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MongoDB Connected</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex bg-navy-950/70 backdrop-blur-sm lg:hidden">
            <div className="relative flex flex-col w-64 bg-navy-950 text-white p-4 h-full shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-navy-800">
                <Image
                  src="/logo.jpg"
                  alt="Property in Lahore"
                  width={2400}
                  height={1792}
                  sizes="112px"
                  className="h-auto w-28 rounded"
                />
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-navy-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold ${
                        isActive
                          ? 'bg-brand-600 text-white'
                          : 'text-navy-300 hover:bg-navy-900'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 text-red-400 py-2.5 text-xs font-bold"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
