/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  "#e8f0f7",
          100: "#c5d5e9",
          200: "#9eb8d9",
          300: "#779ac9",
          400: "#5a84bc",
          500: "#3d6eaf",
          600: "#2d5a9a",
          700: "#1e4481",
          800: "#0D3B5C",
          900: "#082540",
        },
        teal: {
          50:  "#e2f5f3",
          100: "#b8e5e0",
          200: "#8dd4cc",
          300: "#62c3b7",
          400: "#45b6a8",
          500: "#2ba89a",
          600: "#23968a",
          700: "#1a8077",
          800: "#126a63",
          900: "#084e48",
        },
        gold: {
          50:  "#fdf8eb",
          100: "#faeeca",
          200: "#f6e3a7",
          300: "#f2d883",
          400: "#efcf67",
          500: "#ECC94B",
          600: "#d4a832",
          700: "#b8882a",
          800: "#9c6922",
          900: "#7a4d1a",
        },
        cream: "#F8F5F0",
        "off-white": "#FAFAF8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui"],
        serif: ["Playfair Display", "Georgia"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
