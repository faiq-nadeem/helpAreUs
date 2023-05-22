module.exports = {
  mode: "jit",
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        0.1: "1px",
        0.3: "3px",
        0.7: "7px",
      },
      backgroundImage: {
        "mobile-app": "url(images/image.png)",
      },
      colors: (theme) => ({
        "brand-color": "#f27a1b",
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
