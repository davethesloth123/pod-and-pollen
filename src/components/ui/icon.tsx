'use client'

interface IconProps {
  name: string
  size?: number
  stroke?: string
  sw?: number
  fill?: string
  style?: React.CSSProperties
}

export function Icon({ name, size = 24, stroke = 'currentColor', sw = 1.8, fill = 'none', style }: IconProps) {
  const p: React.SVGAttributes<SVGElement> = { fill, stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' }

  const paths: Record<string, React.ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5" {...p} /><path d="M5 10v9h14v-9" {...p} /><path d="M9.5 19v-5h5v5" {...p} /></>,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" {...p} /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" {...p} /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" {...p} /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" {...p} /></>,
    search: <><circle cx="11" cy="11" r="6.5" {...p} /><path d="m20 20-3.6-3.6" {...p} /></>,
    plus: <><path d="M12 5v14M5 12h14" {...p} /></>,
    camera: <><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H7l1.4-2h7.2L17 7h2.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" {...p} /><circle cx="12" cy="13" r="3.4" {...p} /></>,
    note: <><path d="M6 3.5h9L19 7v13.5H6z" {...p} /><path d="M14.5 3.5V7H19" {...p} /><path d="M9 12h7M9 15.5h5" {...p} /></>,
    leaf: <><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13Z" {...p} /><path d="M5 19C8 14 12 11 16 9.5" {...p} /></>,
    flower: <><circle cx="12" cy="12" r="2.6" {...p} /><path d="M12 9.4c1-2.4.4-4.4-2-5.4-1.6 2 .6 4.6 2 5.4ZM12 14.6c-1 2.4-.4 4.4 2 5.4 1.6-2-.6-4.6-2-5.4ZM9.4 12c-2.4-1-4.4-.4-5.4 2 2 1.6 4.6-.6 5.4-2ZM14.6 12c2.4 1 4.4.4 5.4-2-2-1.6-4.6.6-5.4 2Z" {...p} /></>,
    pin: <><path d="M12 21s7-5.4 7-11a7 7 0 0 0-14 0c0 5.6 7 11 7 11Z" {...p} /><circle cx="12" cy="10" r="2.6" {...p} /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" {...p} /><path d="M3.5 9.5h17M8 3v4M16 3v4" {...p} /></>,
    back: <><path d="M15 5l-7 7 7 7" {...p} /></>,
    chevron: <><path d="M9 5l7 7-7 7" {...p} /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" {...p} /></>,
    sliders: <><path d="M4 8h10M18 8h2M4 16h2M10 16h10" {...p} /><circle cx="16" cy="8" r="2.2" {...p} /><circle cx="8" cy="16" r="2.2" {...p} /></>,
    check: <><path d="M5 12.5l4.5 4.5L19 6.5" {...p} /></>,
    x: <><path d="M6 6l12 12M18 6 6 18" {...p} /></>,
    seed: <><path d="M12 3c4 3 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 2-7 6-10Z" {...p} /><path d="M12 21v-9M12 12c-1.6-.6-2.6-1.8-3-3.6M12 12c1.6-.6 2.6-1.8 3-3.6" {...p} /></>,
    sprout: <><path d="M12 20v-7" {...p} /><path d="M12 13c-3.4 0-5.5-2-5.5-5 3.4 0 5.5 2 5.5 5ZM12 13c0-2.8 1.8-4.6 4.6-4.6C16.6 11.2 14.8 13 12 13Z" {...p} /></>,
    dna: <><path d="M7 3c0 5 10 5 10 10s-10 5-10 10M17 3c0 5-10 5-10 10s10 5 10 10" {...p} /><path d="M8.5 7h7M8.5 17h7" {...p} /></>,
    star: <><path d="M12 4l2.3 5 5.4.5-4.1 3.6 1.3 5.3L12 16.9 7.1 18.4l1.3-5.3L4.3 9.5 9.7 9z" {...p} /></>,
    eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></>,
    droplet: <><path d="M12 3c4 4.5 6 7.6 6 10.5a6 6 0 0 1-12 0C6 10.6 8 7.5 12 3Z" {...p} /></>,
    tag: <><path d="M4 12.5V5h7.5L20 13.5 13.5 20 4 12.5Z" {...p} /><circle cx="8.5" cy="9" r="1.4" {...p} fill={stroke} /></>,
    list: <><path d="M8 6h12M8 12h12M8 18h12" {...p} /><circle cx="4" cy="6" r="1.1" {...p} fill={stroke} /><circle cx="4" cy="12" r="1.1" {...p} fill={stroke} /><circle cx="4" cy="18" r="1.1" {...p} fill={stroke} /></>,
    more: <><circle cx="5" cy="12" r="1.6" {...p} fill={stroke} /><circle cx="12" cy="12" r="1.6" {...p} fill={stroke} /><circle cx="19" cy="12" r="1.6" {...p} fill={stroke} /></>,
    book: <><path d="M5 4.5h11A2.5 2.5 0 0 1 18.5 7v13H7.5A2.5 2.5 0 0 0 5 22.5z" {...p} /><path d="M5 4.5v18" {...p} /></>,
    sun: <><circle cx="12" cy="12" r="4" {...p} /><path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" {...p} /></>,
    move: <><path d="M12 3v18M3 12h18" {...p} /><path d="m8 7 4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4" {...p} /></>,
    scissors: <><circle cx="6" cy="6" r="2.5" {...p} /><circle cx="6" cy="18" r="2.5" {...p} /><path d="M8 7.5 20 18M8 16.5 20 6" {...p} /></>,
    clock: <><circle cx="12" cy="12" r="8.5" {...p} /><path d="M12 7.5V12l3 2" {...p} /></>,
    heart: <><path d="M12 20S4 14.5 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 11-8 11Z" {...p} /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" {...p} /><path d="M5 16v3.5h14V16" {...p} /></>,
    iris: <>
      <path d="M12 3.2c-1.6 2-2.6 4-2.6 6.4 0 1.4 1 2.2 2.6 2.2s2.6-0.8 2.6-2.2c0-2.4-1-4.4-2.6-6.4Z" {...p} />
      <path d="M12 11.8c-3 0-5.4 2.2-6.4 5 2 1 4.5 0 6.4-2.4" {...p} />
      <path d="M12 11.8c3 0 5.4 2.2 6.4 5-2 1-4.5 0-6.4-2.4" {...p} />
      <path d="M8.5 13.6h7" {...p} />
      <path d="M12 14.4v6.4" {...p} />
    </>,
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0, ...style }}>
      {paths[name] ?? null}
    </svg>
  )
}
