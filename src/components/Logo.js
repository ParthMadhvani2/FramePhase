'use client';

/**
 * FramePhase logo — a stylized "play" frame with phase lines.
 * Represents video (play triangle) + captioning (text lines).
 * Two sizes: default (navbar) and small (footer).
 */
export default function Logo({ size = 'default' }) {
  const dims = size === 'small' ? 24 : 32;

  return (
    <svg
      width={dims}
      height={dims}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="logoBg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect width="32" height="32" rx="8" fill="url(#logoBg)" />
      {/* Inner shadow/depth */}
      <rect x="1" y="1" width="30" height="30" rx="7" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
      {/* Play triangle — the video symbol */}
      <path
        d="M13 10.5V21.5L22 16L13 10.5Z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Caption line 1 — short */}
      <rect x="8" y="24" width="7" height="1.5" rx="0.75" fill="white" fillOpacity="0.5" />
      {/* Caption line 2 — long */}
      <rect x="17" y="24" width="7" height="1.5" rx="0.75" fill="white" fillOpacity="0.3" />
    </svg>
  );
}
