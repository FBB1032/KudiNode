import React from 'react'

interface Props {
  size?: 'small' | 'medium' | 'large'
  variant?: 'light' | 'dark'
  showText?: boolean
}

export function KudiNodeLogo({ size = 'medium', variant = 'dark', showText = true }: Props) {
  const iconDim = size === 'small' ? 28 : size === 'large' ? 48 : 36
  const textSize = size === 'small' ? 'text-base' : size === 'large' ? 'text-2xl' : 'text-xl'

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {/* 3D Hexagonal Purple Node Frame with Green Node Dots */}
      <div className="relative flex-shrink-0" style={{ width: iconDim, height: iconDim }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          {/* Outer Hexagon Contour */}
          <polygon
            points="50,5 90,27 90,73 50,95 10,73 10,27"
            fill="url(#gradPurple)"
            stroke="#A855F7"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Inner Stylized K */}
          <text
            x="50"
            y="65"
            fontSize="52"
            fontWeight="900"
            fill="#FFFFFF"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            K
          </text>
          {/* 3 Green Node Dots */}
          <circle cx="90" cy="27" r="9" fill="#10B981" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="90" cy="73" r="9" fill="#10B981" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="10" cy="73" r="9" fill="#10B981" stroke="#FFFFFF" strokeWidth="3" />
          {/* Gradients */}
          <defs>
            <linearGradient id="gradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7E22CE" />
              <stop offset="100%" stopColor="#4C1D95" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black ${textSize} tracking-tight`}>
            <span className={variant === 'light' ? 'text-white' : 'text-purple-700 dark:text-purple-400'}>Kudi</span>
            <span className="text-emerald-500">Node </span>
            <span className="text-emerald-500">AI</span>
          </span>
          <span className="text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase mt-0.5">
            Admin Console
          </span>
        </div>
      )}
    </div>
  )
}

export default KudiNodeLogo
