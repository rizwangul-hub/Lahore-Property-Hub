'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const loadingMessages = [
  'Discover Properties Across Lahore',
  'Find Your Dream Home',
  'Explore Houses, Plots & Commercial Properties',
  'Buy • Rent • Sell • Connect',
];

function LahoreSkyline() {
  return (
    <svg
      className="loading-screen__skyline"
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyline-fill" x1="720" y1="0" x2="720" y2="420" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A2450" stopOpacity=".12" />
          <stop offset="1" stopColor="#00A82D" stopOpacity=".18" />
        </linearGradient>
        <linearGradient id="skyline-stroke" x1="720" y1="100" x2="720" y2="420" gradientUnits="userSpaceOnUse">
          <stop stopColor="#65E887" stopOpacity=".08" />
          <stop offset="1" stopColor="#65E887" stopOpacity=".52" />
        </linearGradient>
      </defs>
      <path
        d="M0 369h75v-68h63v68h49V266h61v103h44V226h55v143h38V284h40v85h48V250h52v119h43V143h35V93h12v50h28v226h36V258h45v111h39V228h43v141h34V282h39v87h39V190h41v179h35V246h42v123h42v-62h37v62h78v51H0z"
        fill="url(#skyline-fill)"
        stroke="url(#skyline-stroke)"
        strokeWidth="1.5"
      />
      <path
        d="M526 369h48V233l24-35 24 35v136m-38-149v-33h28v33m-16-33v-35h4v35m216 182h46V226l23-33 23 33v143m-34-143v-31h22v31m-12-31v-29h3v29M90 369v-38l44-37 44 37v38m-67-28h18m18 0h18m-54 15h18m18 0h18"
        stroke="url(#skyline-stroke)"
        strokeWidth="2"
      />
      <path
        d="M0 389c207-14 352-3 526-7 228-5 359-16 532-7 150 8 250 3 382-2"
        stroke="#65E887"
        strokeOpacity=".24"
        strokeWidth="1"
      />
    </svg>
  );
}

export function LoadingScreen() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <div
      className={`loading-screen${isReady ? ' loading-screen--ready' : ''}`}
      aria-hidden={isReady}
    >
      <div className="loading-screen__glow" aria-hidden="true" />
      <LahoreSkyline />

      <div className="loading-screen__content">
        <div className="loading-screen__brand">
          <Image
            src="/logo.jpg"
            alt="Property in Lahore"
            width={2400}
            height={1792}
            priority
            sizes="(max-width: 640px) 78vw, 380px"
            className="loading-screen__logo"
          />
          <div className="loading-screen__rule" aria-hidden="true">
            <span />
          </div>
        </div>

        <p className="loading-screen__status" role="status" aria-live="polite">
          Finding Your Perfect Property...
        </p>

        <div className="loading-screen__progress" aria-hidden="true">
          <span className="loading-screen__spinner" />
          <span className="loading-screen__progress-track">
            <span className="loading-screen__progress-fill" />
          </span>
        </div>

        <div className="loading-screen__messages" aria-hidden="true">
          {loadingMessages.map((message, index) => (
            <span key={message} style={{ animationDelay: `${index * -2}s` }}>
              {message}
            </span>
          ))}
        </div>
      </div>

      <div className="loading-screen__footer" aria-hidden="true">
        DISCOVER <i /> BUY <i /> RENT <i /> SELL
      </div>
    </div>
  );
}
