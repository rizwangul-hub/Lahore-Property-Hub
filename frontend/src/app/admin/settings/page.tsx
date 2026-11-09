'use client';

import React, { useEffect, useState } from 'react';
import { fetchAdminProfile, AdminUser } from '@/lib/adminApi';
import { Shield, Key, Server, Database, CheckCircle2, Lock } from 'lucide-react';

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchAdminProfile().then((data) => setAdmin(data));
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">
          Administrative Settings & Security
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          Review system parameters, cryptographic security controls, and admin profile details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Administrator Profile Card */}
        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">Admin Account</h2>
              <p className="text-xs text-navy-400">Authenticated Session Identity</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center py-2 border-b border-navy-50 text-xs">
              <span className="font-semibold text-navy-500">Full Name</span>
              <span className="font-bold text-navy-800">{admin?.name || 'Administrator'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-navy-50 text-xs">
              <span className="font-semibold text-navy-500">Email Address</span>
              <span className="font-bold text-navy-800">{admin?.email || 'admin@lahorepropertyhub.com'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-navy-50 text-xs">
              <span className="font-semibold text-navy-500">Security Role</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800">
                {admin?.role || 'SUPER_ADMIN'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 text-xs">
              <span className="font-semibold text-navy-500">Account ID</span>
              <span className="font-mono text-[11px] text-navy-400">{admin?.id || '—'}</span>
            </div>
          </div>
        </div>

        {/* Security Architecture Card */}
        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">Authentication Safeguards</h2>
              <p className="text-xs text-navy-400">Active Security Controls</p>
            </div>
          </div>

          <ul className="space-y-3 pt-2 text-xs">
            <li className="flex items-start gap-2.5 text-navy-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>HttpOnly & SameSite Cookies:</strong> Tokens are inaccessible to client-side scripts, neutralizing XSS credential theft.
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-navy-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Bcrypt Password Hashing:</strong> Passwords hashed with high work-factor salts.
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-navy-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Login Brute-Force Rate Limiting:</strong> IP-based request throttling active on all authentication attempts.
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-navy-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Audit Trail Logging:</strong> Moderation actions (approve, reject, edit, delete, status toggle) logged with admin identity & timestamps.
              </span>
            </li>
          </ul>
        </div>

        {/* System & Provisioning Info */}
        <div className="md:col-span-2 rounded-2xl border border-navy-100 bg-white p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100 text-navy-700">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">Admin Account Provisioning</h2>
              <p className="text-xs text-navy-400">Secure CLI Administrative Management</p>
            </div>
          </div>

          <p className="text-xs text-navy-600 leading-relaxed">
            Per strict security requirements, public registration for administrator privileges is disabled. 
            To create or reset an administrator account, run the CLI provisioning script securely from the backend server shell:
          </p>

          <div className="bg-navy-950 text-navy-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
            <code>npm run create-admin -- --email=newadmin@lahorepropertyhub.com --password=&quot;YourSecurePass123!&quot; --name=&quot;Administrator Name&quot;</code>
          </div>
        </div>
      </div>
    </div>
  );
}
