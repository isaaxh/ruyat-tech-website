/** Ruyat Tech Tailwind preset. Usage: presets: [require('./brand-identity/tokens/tailwind.preset.js')] */
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "gold": {
          "50": "#FEF7EC",
          "100": "#FCEBD0",
          "200": "#F9DAA8",
          "300": "#F6C887",
          "400": "#F3BD71",
          "500": "#F0B35E",
          "600": "#D3943D",
          "700": "#AE7424",
          "800": "#8A5A12",
          "900": "#5A3A0B"
        },
        "ink": {
          "50": "#F7F8FC",
          "100": "#EEF1F8",
          "200": "#D3D8E5",
          "300": "#A7B0C8",
          "400": "#7A86A6",
          "500": "#4F5F8C",
          "600": "#2A3D74",
          "700": "#142A63",
          "800": "#0A1C4A",
          "900": "#041238",
          "950": "#030A1F"
        },
        "signal": {
          "success": "#3DD68C",
          "warning": "#FF9F43",
          "error": "#FF5C6C",
          "info": "#5B8CFF"
        },
        "void": "#030A1F",
        "navy": "#041238",
        "frost": "#EEF1F8",
        "lumen": "#FFD9A0"
      },
      "fontFamily": {
        "display": [
          "Satoshi",
          "Readex Pro",
          "Inter",
          "system-ui",
          "sans-serif"
        ],
        "display-ar": [
          "Readex Pro",
          "Satoshi",
          "system-ui",
          "sans-serif"
        ],
        "sans-ar": [
          "IBM Plex Sans Arabic",
          "Inter",
          "system-ui",
          "sans-serif"
        ],
        "sans": [
          "Inter",
          "IBM Plex Sans Arabic",
          "system-ui",
          "sans-serif"
        ],
        "mono": [
          "JetBrains Mono",
          "ui-monospace",
          "monospace"
        ]
      },
      "borderRadius": {
        "xs": "4px",
        "sm": "8px",
        "md": "12px",
        "lg": "20px",
        "xl": "28px"
      },
      "backgroundImage": {
        "rt-horizon": "radial-gradient(60% 60% at 50% 0%, rgba(240,179,94,.35) 0%, rgba(240,179,94,0) 70%)",
        "rt-deep-space": "linear-gradient(180deg, #030A1F 0%, #0A1C4A 100%)",
        "rt-gold-edge": "linear-gradient(135deg, #FFD9A0 0%, #F0B35E 45%, #AE7424 100%)"
      },
      "boxShadow": {
        "glow-gold": "0 0 0 1px rgba(240,179,94,.35), 0 8px 32px -8px rgba(240,179,94,.45)",
        "elev-1": "0 1px 0 0 rgba(255,255,255,.06) inset, 0 8px 24px -12px rgba(0,0,0,.6)"
      },
      "transitionTimingFunction": {
        "rt-out": "cubic-bezier(.22,1,.36,1)",
        "rt-in-out": "cubic-bezier(.65,0,.35,1)",
        "rt-in": "cubic-bezier(.4,0,1,1)"
      }
    }
  }
};
