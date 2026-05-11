/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef6f4",
          100: "#dcebe8",
          500: "#4d7c76",
          600: "#2f5f59",
          700: "#1c4742",
          900: "#122d2a"
        }
      },
      boxShadow: {
        soft: "0 24px 80px rgba(17, 24, 39, 0.08)",
        card: "0 14px 36px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
