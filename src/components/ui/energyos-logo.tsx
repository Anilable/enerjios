'use client';

export const EnerjiOSLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#FF6B35", stopOpacity:1}} />
        <stop offset="50%" style={{stopColor:"#F7931E", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#FFD23F", stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="osGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{stopColor:"#2E86AB", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#A23B72", stopOpacity:1}} />
      </linearGradient>
      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
      </filter>
    </defs>
    <circle cx="45" cy="50" r="35" fill="url(#energyGradient)" filter="url(#dropShadow)" opacity="0.9"/>
    <g stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8">
      <line x1="45" y1="20" x2="45" y2="30" />
      <line x1="65" y1="30" x2="60" y2="35" />
      <line x1="70" y1="50" x2="60" y2="50" />
      <line x1="65" y1="70" x2="60" y2="65" />
      <line x1="45" y1="80" x2="45" y2="70" />
      <line x1="25" y1="70" x2="30" y2="65" />
      <line x1="20" y1="50" x2="30" y2="50" />
      <line x1="25" y1="30" x2="30" y2="35" />
    </g>
    <g fill="white" stroke="white" strokeWidth="1.5">
      <circle cx="45" cy="50" r="8" fill="none" strokeWidth="2"/>
      <line x1="45" y1="44" x2="45" y2="52" strokeWidth="2" strokeLinecap="round"/>
    </g>
    <g fontFamily="Arial, sans-serif">
      <text x="95" y="55" fontSize="32" fontWeight="bold">
        <tspan fill="#2C3E50">Enerji</tspan>
        <tspan fill="url(#osGradient)" fontWeight="300" fontSize="28">OS</tspan>
      </text>
    </g>
    <text x="95" y="75" fontFamily="Arial, sans-serif" fontSize="10" fill="#7F8C8D" opacity="0.8">
      Güneş Enerjisi Yönetim Platformu
    </text>
  </svg>
);

export const EnerjiOSLogoSmall = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="energyGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#FF6B35", stopOpacity:1}} />
        <stop offset="50%" style={{stopColor:"#F7931E", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#FFD23F", stopOpacity:1}} />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="35" fill="url(#energyGradientSmall)" opacity="0.9"/>
    <g stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8">
      <line x1="40" y1="10" x2="40" y2="20" />
      <line x1="60" y1="20" x2="55" y2="25" />
      <line x1="65" y1="40" x2="55" y2="40" />
      <line x1="60" y1="60" x2="55" y2="55" />
      <line x1="40" y1="70" x2="40" y2="60" />
      <line x1="20" y1="60" x2="25" y2="55" />
      <line x1="15" y1="40" x2="25" y2="40" />
      <line x1="20" y1="20" x2="25" y2="25" />
    </g>
    <g fill="white" stroke="white" strokeWidth="1.5">
      <circle cx="40" cy="40" r="8" fill="none" strokeWidth="2"/>
      <line x1="40" y1="34" x2="40" y2="42" strokeWidth="2" strokeLinecap="round"/>
    </g>
  </svg>
);