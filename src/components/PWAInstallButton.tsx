'use client';

import React, { useState, useEffect } from 'react';
import { GetApp, CheckCircle } from 'google-material-icons/filled';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton({
  className = '',
  iconOnly = false,
  label = 'Install App',
}: {
  className?: string;
  iconOnly?: boolean;
  label?: string;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if already installed
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
      ) {
        setIsInstalled(true);
      }

      // Check if iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert('To install BusinessHub on iOS: Tap the Share button (square with arrow) at the bottom of Safari, then tap "Add to Home Screen".');
    }
  };

  // Hide if already running in standalone mode
  if (isInstalled) {
    return null;
  }

  // If not iOS and no install prompt available yet, render prompt when triggered or fallback
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      title="Install BusinessHub to your Desktop or Mobile Home Screen"
      aria-label="Install BusinessHub app"
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-all shadow-sm ${
        iconOnly
          ? 'p-2 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary border border-primary/20'
          : 'px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary text-primary hover:text-on-primary border border-primary/20'
      } ${className}`}
    >
      <GetApp className="w-4 h-4 shrink-0" />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}
