import React from 'react';

export const IconBase = ({ size = 24, color = "currentColor", className = "", children }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {children}
  </svg>
);

export const HomeIcon = (props) => (
  <IconBase {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </IconBase>
);

export const FileTextIcon = (props) => (
  <IconBase {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
  </IconBase>
);

export const PlusIcon = (props) => (
  <IconBase {...props}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </IconBase>
);

export const Share2Icon = (props) => (
  <IconBase {...props}>
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </IconBase>
);

export const LightbulbIcon = (props) => (
  <IconBase {...props}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.4 1.5-3.8 0-3.2-2.8-6-6.2-5.7-2.6.2-4.9 2.5-5.1 5.1-.2 3.4 2.6 6.3 6.3 6.3" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </IconBase>
);

export const SearchIcon = (props) => (
  <IconBase {...props}>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </IconBase>
);

export const UserIcon = (props) => (
  <IconBase {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </IconBase>
);

export const LogOutIcon = (props) => (
  <IconBase {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </IconBase>
);

export const MenuIcon = (props) => (
  <IconBase {...props}>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </IconBase>
);

export const EditIcon = (props) => (
  <IconBase {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </IconBase>
);

export const TrashIcon = (props) => (
  <IconBase {...props}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </IconBase>
);

export const EyeIcon = (props) => (
  <IconBase {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </IconBase>
);

export const LockIcon = (props) => (
  <IconBase {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </IconBase>
);

export const WandIcon = (props) => (
  <IconBase {...props}>
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2 19l3 3 16.36-16.36a1.21 1.21 0 0 0 0-1.72Z"/>
    <path d="m14 7 3 3"/>
    <path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>
  </IconBase>
);

export const SparkleIcon = (props) => (
  <IconBase {...props}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </IconBase>
);

export const BookOpenIcon = (props) => (
  <IconBase {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </IconBase>
);

export const WrenchIcon = (props) => (
  <IconBase {...props}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </IconBase>
);

export const AlertTriangleIcon = (props) => (
  <IconBase {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </IconBase>
);

export const CheckIcon = (props) => (
  <IconBase {...props}>
    <polyline points="20 6 9 17 4 12"/>
  </IconBase>
);

export const ArrowRightIcon = (props) => (
  <IconBase {...props}>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </IconBase>
);

export const NetworkIcon = (props) => (
  <IconBase {...props}>
    <rect x="16" y="16" width="6" height="6" rx="1"/>
    <rect x="2" y="16" width="6" height="6" rx="1"/>
    <rect x="9" y="2" width="6" height="6" rx="1"/>
    <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
    <path d="M12 12V8"/>
  </IconBase>
);

export const BrandLogoIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    {/* ── BACK bubble — upper-right
        Left-cap center (12,9), right-cap center (18,9), r=4
        Body spans x:8–22, y:5–13
        Tail: from right-cap-bottom (18,13) → tip (22,17) → return (15,13)
              = proper triangle tail pointing lower-right                      */}
    <path
      d="M 12 5 L 18 5 A 4 4 0 0 1 18 13 L 22 17 L 15 13 L 12 13 A 4 4 0 0 1 12 5 Z"
      fill="white" stroke={color} strokeWidth="1.1" strokeLinejoin="round"
    />
    {/* ── FRONT bubble — lower-left, drawn ON TOP
        Left-cap center (6,15), right-cap center (12,15), r=4
        Body spans x:2–16, y:11–19
        ★ Overlap zone with back: x:8–16, y:11–13
          Front's white fill paints over back's interior in this zone →
          back bubble's bottom border vanishes behind front = chain-link depth
        Tail: (9,19) → tip (2,22) → return (6,19) = left-cap bottom
              = proper triangle tail pointing lower-left                        */}
    <path
      d="M 6 11 L 12 11 A 4 4 0 0 1 12 19 L 9 19 L 2 22 L 6 19 A 4 4 0 0 1 6 11 Z"
      fill="white" stroke={color} strokeWidth="1.1" strokeLinejoin="round"
    />
    {/* Three muted dots inside front bubble (center x=9, y=15) */}
    <circle cx="7"  cy="15" r="1.1" fill="#C97080" />
    <circle cx="9"  cy="15" r="1.1" fill="#5EA8A3" />
    <circle cx="11" cy="15" r="1.1" fill="#5898B0" />
  </svg>
);

export const SettingsIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 .99-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51.99H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </IconBase>
);

export const PaperclipIcon = (props) => (
  <IconBase {...props}>
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </IconBase>
);
