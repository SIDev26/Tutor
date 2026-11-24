import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f3ecdf",
        card: "#fffaf2",
        ink: "#1d2430",
        pine: "#1f5c45",
        clay: "#c45c32",
        gold: "#e2a423",
      },
      fontFamily: {
        sans: ['"Avenir Next"', "Nunito", "Segoe UI", "sans-serif"],
        serif: ['"Iowan Old Style"', "Palatino", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 12px 32px rgba(70, 46, 12, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
