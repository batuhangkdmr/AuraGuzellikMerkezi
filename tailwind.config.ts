import type { Config } from "tailwindcss";

const config: Config = {
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
        // New Holland Official Brand Colors (from newholland.com.tr)
        primary: {
          blue: "#003767",      // New Holland Primary Blue (rgb(0, 55, 101))
          "blue-light": "#004d8c",
          "blue-dark": "#002a4d",
          "blue-darker": "#001a33",
        },
        secondary: {
          gray: "#6c757d",      // New Holland Gray (Bootstrap secondary)
          "gray-light": "#adb5bd",
          "gray-dark": "#495057",
          "gray-darker": "#343a40",
          "gray-lighter": "#f8f9fa", // Light background
        },
        accent: {
          yellow: "#ffd300",    // New Holland Yellow (rgb(255, 211, 0))
          "yellow-light": "#ffe033",
          "yellow-dark": "#ccaa00",
          "yellow-darker": "#998000",
        },
        // Additional New Holland brand colors (Bootstrap compatible)
        success: "#198754",
        danger: "#dc3545",
        info: "#0dcaf0",
      },
    },
  },
  plugins: [],
};
export default config;

