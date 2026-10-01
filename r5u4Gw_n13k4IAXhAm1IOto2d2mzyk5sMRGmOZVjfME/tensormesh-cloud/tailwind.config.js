/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // TENSOR MESH — technical precision palette
        obsidian: '#0A0B0E', // canvas background
        carbon: '#111318', // card & surface
        graphite: '#181B22', // elevated surface
        hairline: '#1F242F', // 1px precision borders
        badgefill: '#1A202C', // data badge fill
        amber: {
          DEFAULT: '#F59E0B',
          bright: '#FBBF24',
          dim: '#B45309',
        },
        rail: {
          DEFAULT: '#06B6D4', // high-speed cyan
          dim: '#0E7490',
        },
        signal: '#F8FAFC', // pure signal white
        slate: {
          tech: '#8B949E', // muted text
          dim: '#5A6472',
          faint: '#3A414D',
        },
        good: '#10B981',
        warn: '#F59E0B',
        crit: '#EF4444',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          '-apple-system',
          'SF Pro Display',
          'SF Pro Text',
          'Segoe UI Variable Display',
          'Segoe UI',
          'Inter',
          'system-ui',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'ui-monospace',
          'SFMono-Regular',
          'JetBrains Mono',
          'IBM Plex Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter: '-0.02em',
        widest2: '0.18em',
        widest3: '0.28em',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        '2sm': ['0.6875rem', { lineHeight: '1rem' }],
      },
      maxWidth: {
        shell: '1440px',
        prose2: '72ch',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(248,250,252,0.04) inset, 0 24px 60px -32px rgba(0,0,0,0.9)',
        lift: '0 18px 40px -18px rgba(245,158,11,0.45)',
        'lift-cyan': '0 18px 40px -18px rgba(6,182,212,0.45)',
        inset: 'inset 0 0 0 1px #1F242F',
      },
      backgroundImage: {
        'grid-hairline':
          'linear-gradient(to right, rgba(31,36,47,0.55) 1px, transparent 1px), linear-gradient(to bottom, rgba(31,36,47,0.55) 1px, transparent 1px)',
        'amber-sheen': 'linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(245,158,11,0) 62%)',
        'rail-sheen': 'linear-gradient(135deg, rgba(6,182,212,0.14) 0%, rgba(6,182,212,0) 62%)',
      },
      backgroundSize: {
        grid: '48px 48px',
        'grid-sm': '24px 24px',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        pulsering: {
          '0%': { transform: 'scale(0.6)', opacity: '0.9' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        floatup: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1400%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        tick: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        blink: 'blink 1.05s steps(1) infinite',
        pulsering: 'pulsering 2.6s ease-out infinite',
        sheen: 'sheen 3.2s ease-in-out infinite',
        floatup: 'floatup 0.4s ease-out both',
        scanline: 'scanline 6s linear infinite',
        marquee: 'marquee 42s linear infinite',
        tick: 'tick 1.8s ease-in-out infinite',
      },
      transitionTimingFunction: {
        precision: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
