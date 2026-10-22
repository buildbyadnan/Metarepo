import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      textShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
        md: '0 2px 4px rgba(0, 0, 0, 0.5)',
        lg: '0 4px 8px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 255, 255, 0.3)',
        xl: '0 8px 16px rgba(0, 0, 0, 0.6), 0 2px 5px rgba(0, 255, 255, 0.4)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: Function }) {
      const newUtilities = {
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-md': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 255, 255, 0.3)',
        },
        '.text-shadow-xl': {
          textShadow: '0 8px 16px rgba(0, 0, 0, 0.6), 0 2px 5px rgba(0, 255, 255, 0.4)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
} satisfies Config;
