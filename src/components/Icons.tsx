// SVG icon set — all icons accept className and size props
import React from "react";

type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

const icon = (path: React.ReactNode, viewBox = "0 0 24 24") =>
  function Icon({ className, size = 24, strokeWidth = 1.75 }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {path}
      </svg>
    );
  };

export const HomeIcon = icon(
  <>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </>
);

export const WalletIcon = icon(
  <>
    <rect x="2" y="6" width="20" height="13" rx="2" />
    <path d="M2 10h20" />
    <circle cx="16.5" cy="15" r="1" fill="currentColor" stroke="none" />
  </>
);

export const PiggyBankIcon = icon(
  <>
    <path d="M19 11a7.5 7.5 0 0 1-7.5 7.5A7.5 7.5 0 0 1 4 11a7.5 7.5 0 0 1 15 0z" />
    <path d="M19 11h2l.5-2" />
    <path d="M7 15.5l-1.5 2.5" />
    <path d="M13 15.5l1.5 2.5" />
    <path d="M9 8.5C9 7.1 10.1 6 11.5 6S14 7.1 14 8.5" />
  </>
);

export const ListIcon = icon(
  <>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth={2.5} />
    <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth={2.5} />
    <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth={2.5} />
  </>
);

export const CheckSquareIcon = icon(
  <>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </>
);

export const BellIcon = icon(
  <>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </>
);

export const TrendingUpIcon = icon(
  <>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </>
);

export const ChevronRightIcon = icon(
  <polyline points="9 18 15 12 9 6" />
);

export const PlusIcon = icon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>
);

export const GithubIcon = icon(
  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
);

export const MailIcon = icon(
  <>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </>
);

export const LeafIcon = icon(
  <path d="M2 22 12 12M20 2s0 8-6 12c-3 2-7 2-12 2 0-5 0-9 2-12C7 1 12 2 20 2z" />
);
