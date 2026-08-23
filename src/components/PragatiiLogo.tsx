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
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 
        Pragatii Official Brandmark:
        - Tall, prominent 3D 'P' with long elegant vertical stem extending down
        - Top flowing sapphire crest & deep midnight navy face
        - Golden amber 3D beveled outer loop
        - Upward surging financial growth graph line (3 nodes + 3D golden arrowhead)
        - Lower stem warm copper-bronze gradient
        - Super crisp, ultra-clear 'ragatii' cursive typography with perfect theme-aware contrast
      */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 520 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* 1. Golden Outer Loop & 3D Bevel Gradient */}
          <linearGradient id="pGoldBevel" x1="230" y1="85" x2="390" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F3C863" />
            <stop offset="25%" stopColor="#DF9830" />
            <stop offset="60%" stopColor="#BA6818" />
            <stop offset="85%" stopColor="#8C440E" />
            <stop offset="100%" stopColor="#5E2A08" />
          </linearGradient>

          {/* 2. Top Wing / Crest Sweep Gradient */}
          <linearGradient id="pTopWing" x1="120" y1="85" x2="310" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#3b5998" : "#253D7A"} />
            <stop offset="35%" stopColor={isDark ? "#283e75" : "#1C2C5E"} />
            <stop offset="70%" stopColor={isDark ? "#1d2e5a" : "#141F48"} />
            <stop offset="100%" stopColor={isDark ? "#142042" : "#0E1635"} />
          </linearGradient>

          {/* 3. Main 'P' Satin Navy / Deep Indigo Face Gradient */}
          <linearGradient id="pMainNavy" x1="125" y1="95" x2="270" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#3d5da6" : "#2D4685"} />
            <stop offset="20%" stopColor={isDark ? "#2b437e" : "#203369"} />
            <stop offset="55%" stopColor={isDark ? "#1f3263" : "#16234D"} />
            <stop offset="85%" stopColor={isDark ? "#17254c" : "#101838"} />
            <stop offset="100%" stopColor={isDark ? "#0f1a38" : "#0A1026"} />
          </linearGradient>

          {/* 4. Front Loop Inner Volume */}
          <linearGradient id="pLoopFace" x1="160" y1="135" x2="290" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#4365b3" : "#2E4888"} />
            <stop offset="35%" stopColor={isDark ? "#2d4787" : "#1F3266"} />
            <stop offset="80%" stopColor={isDark ? "#1e3161" : "#142044"} />
            <stop offset="100%" stopColor={isDark ? "#142247" : "#0E1530"} />
          </linearGradient>

          {/* 5. Long Lower Stem Warm Copper / Bronze Gradient */}
          <linearGradient id="pLongStemCopper" x1="140" y1="260" x2="200" y2="395" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#1e3161" : "#142044"} />
            <stop offset="35%" stopColor="#452a3a" />
            <stop offset="65%" stopColor="#874735" />
            <stop offset="90%" stopColor="#b86140" />
            <stop offset="100%" stopColor="#cf724a" />
          </linearGradient>

          {/* 6. Metallic Golden Arrow Gradient */}
          <linearGradient id="pArrowGold" x1="270" y1="190" x2="415" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B36718" />
            <stop offset="40%" stopColor="#E29A2B" />
            <stop offset="80%" stopColor="#F6C958" />
            <stop offset="100%" stopColor="#FEE592" />
          </linearGradient>

          {/* 7. Trendline Diagonal Gradient */}
          <linearGradient id="pTrendLine" x1="115" y1="270" x2="360" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#1f3366" : "#142046"} />
            <stop offset="35%" stopColor={isDark ? "#355299" : "#23386E"} />
            <stop offset="65%" stopColor="#9e662c" />
            <stop offset="100%" stopColor="#DF9B2C" />
          </linearGradient>

          {/* 8. Crisp 'ragatii' Text Gradient */}
          <linearGradient id="pRagatiiLightGrad" x1="200" y1="330" x2="440" y2="360" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#101c3d" />
            <stop offset="50%" stopColor="#152857" />
            <stop offset="100%" stopColor="#1a326b" />
          </linearGradient>

          <linearGradient id="pRagatiiDarkGrad" x1="200" y1="330" x2="440" y2="360" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Data Node Gradients */}
          <radialGradient id="pNodeNavy" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={isDark ? "#4c73cc" : "#2E4A8C"} />
            <stop offset="100%" stopColor="#101834" />
          </radialGradient>
          <radialGradient id="pNodeBronze" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#965B43" />
            <stop offset="100%" stopColor="#4A2B1E" />
          </radialGradient>
          <radialGradient id="pNodeGold" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#B57B3D" />
            <stop offset="100%" stopColor="#5E381A" />
          </radialGradient>

          {/* Subtle Drop Shadow */}
          <filter id="pDropShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity={isDark ? "0.35" : "0.15"} />
          </filter>
        </defs>

        <g filter="url(#pDropShadow)">
          {/* ======================================================== */}
          {/* 1. GOLDEN 3D OUTER LOOP OF 'P' (Right Side Curve)        */}
          {/* ======================================================== */}
          <path
            d="M 230 92 C 318 92 384 130 384 205 C 384 266 330 300 248 300 L 220 300 C 290 276 334 238 334 198 C 334 140 282 122 225 122 Z"
            fill="url(#pGoldBevel)"
          />

          {/* ======================================================== */}
          {/* 2. TOP WING / CREST OF 'P' (Left-to-Right Aerodynamic)   */}
          {/* ======================================================== */}
          <path
            d="M 120 92 C 182 82 284 84 336 124 C 282 104 200 102 120 122 Z"
            fill="url(#pTopWing)"
          />

          {/* ======================================================== */}
          {/* 3. TALL, PROMINENT 3D 'P' BODY WITH LONG LOWER STEM      */}
          {/* ======================================================== */}
          {/* Full vertical column of P starting at top (y=92) and extending far down (y=388) */}
          <path
            d="M 128 92 C 190 84 298 90 326 126 C 290 120 234 122 196 134 C 166 144 158 160 158 188 L 158 320 C 158 358 174 382 196 390 C 172 396 142 384 132 354 C 124 316 124 236 124 148 C 124 108 124 98 128 92 Z"
            fill="url(#pMainNavy)"
            stroke={isDark ? "rgba(147, 197, 253, 0.25)" : "none"}
            strokeWidth={isDark ? "1.5" : "0"}
          />

          {/* Curved Front Face of the P Loop */}
          <path
            d="M 158 136 C 186 128 274 126 310 158 C 334 182 336 218 310 246 C 286 270 242 280 186 280 L 158 280 L 158 140 Z"
            fill="url(#pLoopFace)"
          />

          {/* Long Lower Stem Copper/Bronze Gradient Extension */}
          <path
            d="M 124 280 L 158 280 L 158 320 C 158 358 174 382 196 390 C 172 396 142 384 132 354 C 126 330 124 305 124 280 Z"
            fill="url(#pLongStemCopper)"
          />

          {/* ======================================================== */}
          {/* 4. GROWTH GRAPH TRENDLINE & 3D ARROW                     */}
          {/* ======================================================== */}
          {/* Slicing diagonal line across the P */}
          <path
            d="M 120 270 L 226 182 L 268 210 L 368 128"
            stroke="url(#pTrendLine)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Top-Right Golden Arrow Shaft Segment */}
          <path
            d="M 268 210 L 374 120"
            stroke="url(#pArrowGold)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Golden 3D Arrowhead Surging Upwards */}
          <path
            d="M 342 108 L 404 96 L 388 158 L 362 134 Z"
            fill="url(#pArrowGold)"
            stroke="#DF9928"
            strokeWidth="1.5"
          />

          {/* Three Strategic Growth Nodes */}
          {/* Node 1: Base Starting Dot (on left stem) */}
          <circle cx="120" cy="270" r="15" fill="url(#pNodeNavy)" stroke={isDark ? "#60a5fa" : "#2C488C"} strokeWidth="2.5" />
          
          {/* Node 2: Peak Pivot Dot */}
          <circle cx="226" cy="182" r="13" fill="url(#pNodeBronze)" stroke="#9E6850" strokeWidth="2" />

          {/* Node 3: Dip Valley Dot */}
          <circle cx="268" cy="210" r="13" fill="url(#pNodeGold)" stroke="#BD7D3A" strokeWidth="2" />

          {/* ======================================================== */}
          {/* 5. ULTRA-CLEAR & HIGH-LEGIBILITY 'ragatii' SCRIPT        */}
          {/* ======================================================== */}
          {/* 
            Rendered with high-precision calligraphy for 100% clarity:
            In Dark Mode: Bright luminous cyan-sapphire for instant readability on dark background.
            In Light Mode: Rich royal deep navy for high-contrast readability on white background.
          */}
          <text
            x="320"
            y="356"
            textAnchor="middle"
            fontFamily="'Dancing Script', 'Caveat', 'Brush Script MT', 'Pacifico', cursive, sans-serif"
            fontSize="68"
            fontWeight="bold"
            fontStyle="italic"
            letterSpacing="2.5"
            fill={isDark ? "url(#pRagatiiDarkGrad)" : "url(#pRagatiiLightGrad)"}
            stroke={isDark ? "#38bdf8" : "none"}
            strokeWidth={isDark ? "1" : "0"}
          >
            ragatii
          </text>

          {/* Stylish Calligraphic Brush Accent Flicks at top-right */}
          <g fill={isDark ? "#38bdf8" : "#152857"}>
            <path d="M 431 304 C 441 302 452 300 461 299 C 452 303 443 309 435 314 Z" />
            <path d="M 443 310 C 451 308 459 306 465 305 C 457 309 450 314 445 318 Z" opacity="0.8" />
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
