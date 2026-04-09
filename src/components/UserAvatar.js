'use client';

import { useState } from 'react';

/**
 * Consistent user avatar used across the app (navbar, dashboard, etc.)
 *
 * Logic:
 *   1. If the user has an image and it loads successfully → show the image.
 *   2. Otherwise (no image, or image failed to load due to COEP, network,
 *      or Google returning 404) → show a colored initial fallback.
 *
 * Using a state-based fallback means every surface in the app renders the
 * exact same avatar for the same user, regardless of whether Google's
 * profile image happens to be blocked on that particular page.
 */
export default function UserAvatar({ user, size = 32, ring = true, className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = (user?.name || user?.email || 'U').trim()[0]?.toUpperCase() || 'U';
  const showImage = user?.image && !imgFailed;
  const px = `${size}px`;

  const base = `rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
    ring ? 'ring-2 ring-brand-500/30' : ''
  } ${className}`;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={user.name || 'Profile'}
        onError={() => setImgFailed(true)}
        referrerPolicy="no-referrer"
        className={base}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <div
      className={`${base} bg-brand-600 text-white font-bold`}
      style={{ width: px, height: px, fontSize: `${Math.round(size * 0.45)}px` }}
      aria-label={user?.name || 'User'}
    >
      {initial}
    </div>
  );
}
