'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { submitPropertyEnquiry, recordAnalyticsEvent } from '@/lib/api';

interface PropertyEnquirySectionProps {
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  propertyReferenceId?: string;
  whatsappContact?: string;
  contactName?: string;
}

export function PropertyEnquirySection({
  propertyId,
  propertyTitle,
  propertySlug,
  propertyReferenceId,
  whatsappContact,
  contactName,
}: PropertyEnquirySectionProps) {
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactMethod, setContactMethod] = useState<'WHATSAPP' | 'PHONE' | 'EMAIL'>('WHATSAPP');
  const [message, setMessage] = useState(
    'Hello, I am interested in this property. Please provide more details and viewing availability.'
  );
  const [honeypot, setHoneypot] = useState(''); // Anti-spam trap

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Record PAGE_VIEW analytics on mount
  useEffect(() => {
    let visitorSessionId = '';
    try {
      visitorSessionId = localStorage.getItem('lph_session_id') || '';
      if (!visitorSessionId) {
        visitorSessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('lph_session_id', visitorSessionId);
      }
    } catch {
      visitorSessionId = 'sess_' + Date.now();
    }

    recordAnalyticsEvent({
      eventType: 'PAGE_VIEW',
      propertyId,
      propertySlug,
      visitorSessionId,
    });
  }, [propertyId, propertySlug]);

  // Clean WhatsApp phone number for click-to-chat
  const cleanWhatsappNumber = (whatsappContact || '').replace(/[\s\-\(\)\+]/g, '');

  const handleWhatsAppClick = () => {
    recordAnalyticsEvent({
      eventType: 'WHATSAPP_CLICK',
      propertyId,
      propertySlug,
    });

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Hello, I am interested in this property: "${propertyTitle}" (${currentUrl}). Is it still available?`;
    const waUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please provide your WhatsApp or mobile number');
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage('Please provide a message with at least 5 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await submitPropertyEnquiry({
        propertyId,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim(),
        message: message.trim(),
        preferredContactMethod: contactMethod,
        _hp: honeypot,
      });

      if (res.success) {
        setSuccess(true);
        setName('');
        setPhone('');
        setEmail('');
        setMessage('Hello, I am interested in this property. Please provide more details.');
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Unable to send enquiry. Please try again or chat via WhatsApp directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Direct WhatsApp Click-to-Chat CTA */}
      <div className="space-y-3">
        {cleanWhatsappNumber && (
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 py-3.5 px-4 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5 fill-white" />
            <span>Chat Directly on WhatsApp</span>
          </button>
        )}
        <p className="text-[11px] text-navy-400 text-center flex items-center justify-center gap-1">
          <Clock className="h-3 w-3 text-brand-600" />
          <span>Typical WhatsApp response time: &lt; 15 minutes</span>
        </p>
      </div>

      <div className="relative flex items-center my-4">
        <div className="flex-grow border-t border-navy-100" />
        <span className="flex-shrink mx-3 text-[11px] font-bold text-navy-400 uppercase tracking-wider">
          Or Send Written Enquiry
        </span>
        <div className="flex-grow border-t border-navy-100" />
      </div>

      {/* 2. Lead Enquiry Form */}
      {success ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-center space-y-3 animate-fade-in">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">Enquiry Submitted!</h4>
            <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
              Your message regarding <strong>{propertyTitle}</strong> has been received. The property representative has been notified and will contact you via your preferred channel.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="text-xs font-bold text-brand-700 underline hover:text-brand-800 mt-2 inline-block"
          >
            Send Another Enquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Hidden Honeypot Field for anti-spam */}
          <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
            <label htmlFor="_hp_trap">Leave blank</label>
            <input
              type="text"
              id="_hp_trap"
              name="_hp_trap"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-navy-800 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-navy-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className="w-full rounded-xl border border-navy-200 bg-white py-2.5 pl-9 pr-3 text-xs font-medium text-navy-900 placeholder:text-navy-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-bold text-navy-800 mb-1">
              WhatsApp / Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-navy-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567 or +92 300 1234567"
                className="w-full rounded-xl border border-navy-200 bg-white py-2.5 pl-9 pr-3 text-xs font-medium text-navy-900 placeholder:text-navy-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>
          </div>

          {/* Email Field (Optional) */}
          <div>
            <label className="block text-xs font-bold text-navy-800 mb-1">
              Email Address <span className="text-navy-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-navy-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-navy-200 bg-white py-2.5 pl-9 pr-3 text-xs font-medium text-navy-900 placeholder:text-navy-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>
          </div>

          {/* Preferred Contact Method */}
          <div>
            <label className="block text-xs font-bold text-navy-800 mb-1.5">
              Preferred Contact Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle },
                { id: 'PHONE', label: 'Phone', icon: Phone },
                { id: 'EMAIL', label: 'Email', icon: Mail },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = contactMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setContactMethod(opt.id as any)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-navy-200 bg-white text-navy-600 hover:bg-navy-50'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-bold text-navy-800 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about price flexibility, visit scheduling, or documentation..."
              className="w-full rounded-xl border border-navy-200 bg-white p-3 text-xs font-medium text-navy-900 placeholder:text-navy-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 px-4 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Sending Enquiry...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Lead Enquiry</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-navy-400">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
            <span>Spam protected. Customer information remains confidential.</span>
          </div>
        </form>
      )}
    </div>
  );
}
