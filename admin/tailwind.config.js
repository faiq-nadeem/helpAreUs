module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        0.1: "1px",
      },
      backgroundImage: {
        "mobile-app": "url(images/image.png)",
      },
      colors: (theme) => ({
        "brand-color": "#4c3398",
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
