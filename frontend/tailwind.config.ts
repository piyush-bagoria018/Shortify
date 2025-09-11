// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // For Next.js App Router
    "./pages/**/*.{js,ts,jsx,tsx}", // For Pages Router
    "./components/**/*.{js,ts,jsx,tsx}", // Your components
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brandPink: "#eb568e",
        brandBlue: "#144ee3",
      },
    },
  },
  plugins: [],
};

export default config;
