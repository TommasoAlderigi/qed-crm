'use client'

import { useState } from 'react'
import { Building2 } from 'lucide-react'

type Props = {
  domain: string | null
  name: string
  size?: number
  className?: string
  rounded?: 'md' | 'lg' | 'full'
}

const ROUNDED = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

export function CompanyLogo({
  domain,
  name,
  size = 40,
  className = '',
  rounded = 'md',
}: Props) {
  // Always request a high-res source so the image looks sharp even on retina displays.
  // CSS scales it down via the width/height props.
  const hiRes = Math.max(256, size * 4)
  const sources = domain
    ? [
        `https://logo.clearbit.com/${domain}?size=${hiRes}`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
      ]
    : []

  const [idx, setIdx] = useState(0)
  const [failed, setFailed] = useState(false)

  const containerClass = `inline-flex items-center justify-center bg-slate-100 ${ROUNDED[rounded]} overflow-hidden shrink-0 ${className}`

  if (!domain || failed) {
    return (
      <span
        className={containerClass}
        style={{ width: size, height: size }}
        aria-label={`${name} logo placeholder`}
      >
        <Building2 size={Math.round(size * 0.5)} className="text-slate-400" />
      </span>
    )
  }

  return (
    <span
      className={containerClass}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sources[idx]}
        alt={`${name} logo`}
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size }}
        onError={() => {
          if (idx + 1 < sources.length) {
            setIdx(idx + 1)
          } else {
            setFailed(true)
          }
        }}
      />
    </span>
  )
}
