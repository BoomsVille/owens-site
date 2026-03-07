import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        slateInk: "#07111f",
        slatePanel: "#0e1b30",
        slateLine: "#1f3558",
        mist: "#d8e3f6",
        mistSoft: "#93a5c4",
        accentBlue: "#7da2de",
        accentBlueSoft: "#96b5e7"
      },
      boxShadow: {
        panel: "0 16px 40px rgba(2, 9, 18, 0.4)"
      },
      maxWidth: {
        layout: "1180px"
      }
    }
  },
  plugins: []
};

export default config;
