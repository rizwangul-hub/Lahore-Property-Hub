'use client';

import { useEffect, useState } from 'react';
import { Check, Download, X } from 'lucide-react';

type InstallChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

const INSTALLED_STORAGE_KEY = 'property-in-lahore-installed';

function wasPreviouslyInstalled() {
  try {
    return window.localStorage.getItem(INSTALLED_STORAGE_KEY) === 'true';
  } catch (error) {
    console.warn('Unable to read the Property in Lahore installation state.', error);
    return false;
  }
}

function rememberInstalled() {
  try {
    window.localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
  } catch (error) {
    console.warn('Unable to save the Property in Lahore installation state.', error);
  }
}

export function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const detectInstalled = () => {
      const isStandalone =
        standaloneQuery.matches ||
        ('standalone' in navigator &&
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
      setInstalled(isStandalone || wasPreviouslyInstalled());
    };

    const platform = `${navigator.userAgent} ${navigator.platform}`;
    setIsIos(/iPhone|iPad|iPod/i.test(platform) || (/Mac/i.test(platform) && navigator.maxTouchPoints > 1));
    detectInstalled();
    standaloneQuery.addEventListener('change', detectInstalled);

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      rememberInstalled();
      setInstalled(true);
      setInstallPrompt(null);
      setIsOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .catch((error: unknown) => {
          console.error('Unable to register the Property in Lahore service worker.', error);
        });
    }

    return () => {
      standaloneQuery.removeEventListener('change', detectInstalled);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === 'accepted') {
        rememberInstalled();
        setInstalled(true);
        setIsOpen(false);
      } else {
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Unable to open the browser installation prompt.', error);
      setInstallPrompt(null);
      setShowInstructions(true);
    }
  };

  const openInstallDialog = () => {
    setShowInstructions(false);
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={installed ? undefined : openInstallDialog}
        disabled={installed}
        aria-label={installed ? 'Property in Lahore app is installed' : 'Install App'}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-navy-200 bg-white px-2.5 text-[11px] font-semibold text-navy-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-default disabled:text-brand-700 sm:px-3 sm:text-xs"
      >
        {installed ? <Check className="h-4 w-4 text-brand-600" /> : <Download className="h-4 w-4" />}
        <span>{installed ? 'App Installed' : 'Install App'}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/60 bg-white p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-navy-500 transition hover:bg-navy-100 hover:text-navy-900"
              aria-label="Close install information"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700">
                Property marketplace
              </p>
              <h2 id="pwa-install-title" className="mt-2 text-2xl font-extrabold text-navy-950">
                Install Property in Lahore
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                Get faster access to Lahore properties directly from your home screen.
              </p>
            </div>

            <ul className="mt-5 grid gap-2 text-sm text-navy-700 sm:grid-cols-2">
              <li>Browse properties easily.</li>
              <li>Find houses for rent.</li>
              <li>Discover properties for sale.</li>
              <li>Explore Lahore societies.</li>
              <li className="sm:col-span-2">Contact property owners through WhatsApp.</li>
            </ul>

            {(isIos || showInstructions || !installPrompt) && (
              <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-sm text-navy-700">
                {isIos ? (
                  <>
                    <p className="font-bold text-navy-900">Add to your iPhone or iPad</p>
                    <ol className="mt-2 list-inside list-decimal space-y-1.5">
                      <li>Open this website in Safari.</li>
                      <li>Tap the Share button.</li>
                      <li>Select “Add to Home Screen”.</li>
                      <li>Tap “Add”.</li>
                    </ol>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-navy-900">Install from your browser</p>
                    <p className="mt-1.5 leading-relaxed">
                      In Chrome or Edge, use the install icon in the address bar, or open the
                      browser menu and choose “Install app” or “Add to Home screen”.
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-navy-200 px-5 py-3 text-sm font-bold text-navy-700 transition hover:bg-navy-50"
              >
                Maybe Later
              </button>
              <button
                type="button"
                onClick={handleInstall}
                className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                Install Now
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
