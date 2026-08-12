export function applyThemeSettings() {
  if (typeof window === 'undefined') return;

  // 1. Accent color mapping to Tailwind CSS variables dynamically
  const accent = localStorage.getItem('om_accent_color') || 'lavender';
  const colors: Record<string, Record<string, string>> = {
    lavender: {
      '50': '#F7F3FF', '100': '#EDE5FF', '200': '#DDD0FF', '300': '#C4AAFF', '400': '#B79AF7',
      '500': '#9B7DE8', '600': '#7C5DC9', '700': '#6344A9', '800': '#4D3487', '900': '#3A2768'
    },
    blue: {
      '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd', '400': '#60a5fa',
      '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af', '900': '#1e3a8a'
    },
    green: {
      '50': '#f0fdf4', '100': '#dcfce7', '200': '#bbf7d0', '300': '#86efac', '400': '#4ade80',
      '500': '#10b981', '600': '#059669', '700': '#047857', '800': '#065f46', '900': '#064e3b'
    },
    rose: {
      '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185',
      '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337'
    },
    amber: {
      '50': '#fffbeb', '100': '#fef3c7', '200': '#fde68a', '300': '#fcd34d', '400': '#fbbf24',
      '500': '#f59e0b', '600': '#d97706', '700': '#b45309', '800': '#92400e', '900': '#78350f'
    },
    cyan: {
      '50': '#ecfeff', '100': '#cffafe', '200': '#a5f3fc', '300': '#67e8f9', '400': '#22d3ee',
      '500': '#06b6d4', '600': '#0891b2', '700': '#0369a1', '800': '#075985', '900': '#0c4a6e'
    }
  };

  const selectedPalette = colors[accent] || colors.lavender;
  const rootStyle = document.documentElement.style;

  // Set the lavender shades to the selected accent colors dynamically
  // Since Tailwind v4 maps color variables directly from CSS, this changes it app-wide
  Object.entries(selectedPalette).forEach(([shade, hex]) => {
    rootStyle.setProperty(`--color-lavender-${shade}`, hex);
  });
  
  // Set custom accent variables
  rootStyle.setProperty('--accent', selectedPalette['400']);
  rootStyle.setProperty('--accent-light', selectedPalette['100']);
  rootStyle.setProperty('--accent-lighter', selectedPalette['50']);
  rootStyle.setProperty('--accent-dark', selectedPalette['500']);

  // Sync shadcn/ui components (which use HSL variables)
  const hexToHslString = (hex: string): string => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);
    return `${hDeg} ${sPct}% ${lPct}%`;
  };

  const primaryHsl = hexToHslString(selectedPalette['500']);
  const ringHsl = hexToHslString(selectedPalette['400']);
  const accentUiHsl = hexToHslString(selectedPalette['50']);
  const accentFgHsl = hexToHslString(selectedPalette['700']);

  rootStyle.setProperty('--primary', primaryHsl);
  rootStyle.setProperty('--ring', ringHsl);
  rootStyle.setProperty('--accent-hsl', accentUiHsl);
  rootStyle.setProperty('--accent-foreground', accentFgHsl);

  // 2. Font family application
  const font = localStorage.getItem('om_font_family') || 'Inter';
  const fonts: Record<string, string> = {
    Inter: '"Inter", sans-serif',
    Roboto: '"Roboto", sans-serif',
    Outfit: '"Outfit", sans-serif',
    'JetBrains Mono': '"JetBrains Mono", monospace',
    System: 'system-ui, -apple-system, sans-serif'
  };
  rootStyle.setProperty('--font-sans', fonts[font] || fonts.Inter);

  // 3. Chat density application
  const density = localStorage.getItem('om_chat_density') || 'comfortable';
  if (density === 'compact') {
    rootStyle.setProperty('--chat-message-gap', '10px');
    rootStyle.setProperty('--chat-message-padding', '6px 12px');
  } else if (density === 'spacious') {
    rootStyle.setProperty('--chat-message-gap', '28px');
    rootStyle.setProperty('--chat-message-padding', '18px 24px');
  } else {
    // comfortable
    rootStyle.setProperty('--chat-message-gap', '18px');
    rootStyle.setProperty('--chat-message-padding', '12px 18px');
  }

  // 4. Code Block theme setting via dynamic CDN stylesheet injection
  const codeTheme = localStorage.getItem('om_code_theme') || 'One Dark';
  const cdnStyles: Record<string, string> = {
    'One Dark': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css',
    'GitHub Dark': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
    'Dracula': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/dracula.min.css',
    'Monokai': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/monokai-sublime.min.css',
    'Nord': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/nord.min.css'
  };

  let linkEl = document.getElementById('hljs-theme-stylesheet') as HTMLLinkElement;
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.id = 'hljs-theme-stylesheet';
    linkEl.rel = 'stylesheet';
    document.head.appendChild(linkEl);
  }
  linkEl.href = cdnStyles[codeTheme] || cdnStyles['One Dark'];
}
