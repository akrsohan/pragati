import React from 'react';

interface PragatiiLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  theme?: 'light' | 'dark';
}

export const PragatiiLogo: React.FC<PragatiiLogoProps> = ({
  className = '',
  size = 52,
  showText = false,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 
        Pragatii Official Brandmark:
        - 100% Faithful Recreation of the provided Brand Identity:
        - Stylized 3D letter 'P' with sapphire navy curves and golden amber volumetric arch
        - Hollow transparent interior
        - Ascending financial growth trendline with 3 circular nodes and 3D golden arrowhead
        - Warm copper/bronze bottom gradient on the vertical stem
        - Elegant cursive 'ragatii' calligraphy with dynamic brush accents over the 'ii'
      */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-[1.02]"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* 1. Golden Outer Loop 3D Gradient */}
          <linearGradient id="pragatiiGoldLoop" x1="220" y1="60" x2="420" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F9D976" />
            <stop offset="20%" stopColor="#F39C12" />
            <stop offset="50%" stopColor="#D68910" />
            <stop offset="80%" stopColor="#A0522D" />
            <stop offset="100%" stopColor="#6E2C00" />
          </linearGradient>

          {/* 2. Top Navy Wing / Crest Sweep */}
          <linearGradient id="pragatiiTopWing" x1="90" y1="50" x2="340" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#3b5998" : "#243c7b"} />
            <stop offset="35%" stopColor={isDark ? "#283e75" : "#1b2c5e"} />
            <stop offset="70%" stopColor={isDark ? "#1a2c5a" : "#132047"} />
            <stop offset="100%" stopColor={isDark ? "#101d3d" : "#0d1633"} />
          </linearGradient>

          {/* 3. Main Sapphire Navy Vertical Stem */}
          <linearGradient id="pragatiiStemNavy" x1="85" y1="60" x2="195" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#4568b2" : "#2c488f"} />
            <stop offset="25%" stopColor={isDark ? "#2f4c87" : "#1f366e"} />
            <stop offset="60%" stopColor={isDark ? "#1d3260" : "#15254f"} />
            <stop offset="85%" stopColor={isDark ? "#142345" : "#0e1937"} />
            <stop offset="100%" stopColor={isDark ? "#0c152b" : "#080f22"} />
          </linearGradient>

          {/* 4. Lower Stem Warm Copper / Bronze Tip */}
          <linearGradient id="pragatiiStemCopper" x1="90" y1="280" x2="185" y2="420" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#1d3260" : "#15254f"} />
            <stop offset="35%" stopColor="#482736" />
            <stop offset="65%" stopColor="#8d4b31" />
            <stop offset="90%" stopColor="#be673b" />
            <stop offset="100%" stopColor="#d98254" />
          </linearGradient>

          {/* 5. Golden Arrowhead & Shaft Gradient */}
          <linearGradient id="pragatiiArrowGold" x1="280" y1="180" x2="445" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C0721B" />
            <stop offset="30%" stopColor="#E69F2A" />
            <stop offset="70%" stopColor="#F7CD59" />
            <stop offset="100%" stopColor="#FFECA1" />
          </linearGradient>

          {/* Arrowhead Highlight Facet */}
          <linearGradient id="pragatiiArrowFacetLight" x1="360" y1="75" x2="445" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF2B8" />
            <stop offset="100%" stopColor="#F3B336" />
          </linearGradient>

          {/* Arrowhead Shadow Facet */}
          <linearGradient id="pragatiiArrowFacetDark" x1="360" y1="135" x2="445" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B26514" />
            <stop offset="100%" stopColor="#E39423" />
          </linearGradient>

          {/* 6. Growth Chart Path Gradient */}
          <linearGradient id="pragatiiTrendLine" x1="50" y1="270" x2="380" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#284485" : "#172957"} />
            <stop offset="35%" stopColor={isDark ? "#3f64b8" : "#243c7b"} />
            <stop offset="65%" stopColor="#a7682a" />
            <stop offset="100%" stopColor="#E6A12E" />
          </linearGradient>

          {/* 7. 'ragatii' Text Gradient */}
          <linearGradient id="pragatiiTextLight" x1="170" y1="330" x2="460" y2="390" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f1f4b" />
            <stop offset="50%" stopColor="#182d63" />
            <stop offset="100%" stopColor="#1e3878" />
          </linearGradient>

          <linearGradient id="pragatiiTextDark" x1="170" y1="330" x2="460" y2="390" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Data Node Gradients */}
          <radialGradient id="pragatiiNodeBlue" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={isDark ? "#5986eb" : "#3257a8"} />
            <stop offset="100%" stopColor="#0e1733" />
          </radialGradient>
          <radialGradient id="pragatiiNodeBronze" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ad6a4f" />
            <stop offset="100%" stopColor="#4e2b1b" />
          </radialGradient>
          <radialGradient id="pragatiiNodeGold" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#d2964e" />
            <stop offset="100%" stopColor="#633914" />
          </radialGradient>

          {/* Subtle Drop Shadow */}
          <filter id="pragatiiDropShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity={isDark ? "0.4" : "0.15"} />
          </filter>
        </defs>

        <g filter="url(#pragatiiDropShadow)">
          {/* ======================================================== */}
          {/* 1. GOLDEN 3D OUTER LOOP OF 'P' (Right Volumetric Arch)   */}
          {/* ======================================================== */}
          <path
            d="M 235 70 C 330 70 405 110 405 195 C 405 264 344 306 250 306 L 220 306 C 298 280 348 238 348 190 C 348 126 290 105 228 105 Z"
            fill="url(#pragatiiGoldLoop)"
          />

          {/* Golden Loop Inner 3D Highlight Rim */}
          <path
            d="M 235 72 C 322 72 396 108 396 195 C 396 230 375 262 335 284 C 362 258 378 226 378 190 C 378 132 322 107 245 107 Z"
            fill="#FFE89C"
            opacity="0.35"
          />

          {/* ======================================================== */}
          {/* 2. TOP SAPPHIRE CREST / WING (Smooth Aerodynamic Flow)    */}
          {/* ======================================================== */}
          <path
            d="M 95 72 C 160 58 280 62 350 108 C 290 85 200 82 95 105 Z"
            fill="url(#pragatiiTopWing)"
          />

          {/* ======================================================== */}
          {/* 3. TALL 3D 'P' VERTICAL COLUMN / SAPPHIRE STEM           */}
          {/* ======================================================== */}
          <path
            d="M 102 72 C 145 64 165 86 165 120 L 165 315 C 165 365 180 402 195 412 C 166 418 128 402 114 366 C 102 324 100 230 100 135 C 100 92 100 80 102 72 Z"
            fill="url(#pragatiiStemNavy)"
          />

          {/* Stem Front Highlight Curve */}
          <path
            d="M 108 80 C 138 74 150 92 150 125 L 150 300 C 144 260 144 140 108 80 Z"
            fill="#60A5FA"
            opacity="0.22"
          />

          {/* Lower Stem Warm Copper / Bronze Extension */}
          <path
            d="M 100 275 L 165 275 L 165 315 C 165 365 180 402 195 412 C 166 418 128 402 114 366 C 106 338 102 308 100 275 Z"
            fill="url(#pragatiiStemCopper)"
          />

          {/* ======================================================== */}
          {/* 4. GROWTH GRAPH TRENDLINE & 3D ARROW                     */}
          {/* ======================================================== */}
          {/* Diagonal Surge Line across the P */}
          <path
            d="M 60 272 L 182 178 L 235 210 L 372 108"
            stroke="url(#pragatiiTrendLine)"
            strokeWidth="17"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Golden Upper Segment towards Arrow */}
          <path
            d="M 235 210 L 382 98"
            stroke="url(#pragatiiArrowGold)"
            strokeWidth="17"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3D Arrowhead Facets */}
          <g>
            {/* Top Light Facet */}
            <path
              d="M 345 84 L 436 68 L 388 116 Z"
              fill="url(#pragatiiArrowFacetLight)"
              stroke="#D68910"
              strokeWidth="1"
            />
            {/* Bottom Dark Facet */}
            <path
              d="M 388 116 L 436 68 L 416 142 Z"
              fill="url(#pragatiiArrowFacetDark)"
              stroke="#B26514"
              strokeWidth="1"
            />
          </g>

          {/* Three Growth Nodes (Dots) */}
          {/* Node 1: Base Anchor Dot on left stem */}
          <circle cx="60" cy="272" r="16" fill="url(#pragatiiNodeBlue)" stroke={isDark ? "#60a5fa" : "#2C4A90"} strokeWidth="2.5" />
          
          {/* Node 2: Middle Pivot Dot */}
          <circle cx="182" cy="178" r="14" fill="url(#pragatiiNodeBronze)" stroke="#A06248" strokeWidth="2" />

          {/* Node 3: Dip / Launching Dot */}
          <circle cx="235" cy="210" r="14" fill="url(#pragatiiNodeGold)" stroke="#C6853C" strokeWidth="2" />

          {/* ======================================================== */}
          {/* 5. 'ragatii' CURSIVE SCRIPT CALLIGRAPHY                  */}
          {/* ======================================================== */}
          <text
            x="320"
            y="372"
            textAnchor="middle"
            fontFamily="'Dancing Script', 'Alex Brush', 'Caveat', 'Brush Script MT', cursive, sans-serif"
            fontSize="76"
            fontWeight="700"
            fontStyle="italic"
            letterSpacing="2"
            fill={isDark ? "url(#pragatiiTextDark)" : "url(#pragatiiTextLight)"}
            stroke={isDark ? "#38bdf8" : "none"}
            strokeWidth={isDark ? "0.8" : "0"}
          >
            ragatii
          </text>

          {/* Dynamic Brush Accents above the 'ii' */}
          <g fill={isDark ? "#38bdf8" : "#182d63"}>
            <path d="M 432 312 C 443 310 455 307 465 306 C 455 311 445 318 436 324 Z" />
            <path d="M 445 319 C 454 316 462 314 469 313 C 460 318 452 324 446 328 Z" opacity="0.85" />
          </g>
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold text-xl sm:text-2xl tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Pragatii
          </span>
          <span className={`text-[10px] sm:text-[11px] uppercase font-bold tracking-widest mt-1 ${isDark ? 'text-[#37f0ff]' : 'text-blue-600'}`}>
            Skill &amp; Growth Hub
          </span>
        </div>
      )}
    </div>
  );
};

export default PragatiiLogo;

