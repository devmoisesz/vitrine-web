import localFont from "next/font/local";

export const bodoniModa = localFont({
  src: "../../public/fonts/bodoni-moda-latin.woff2",
  variable: "--font-serif",
  weight: "400 900",
  display: "swap",
});

export const inter = localFont({
  src: "../../public/fonts/inter-latin.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

export const lato = localFont({
  src: [
    { path: "../../public/fonts/lato-400.woff2", weight: "400" },
    { path: "../../public/fonts/lato-700.woff2", weight: "700" },
    { path: "../../public/fonts/lato-900.woff2", weight: "900" },
  ],
  variable: "--font-lato",
  display: "swap",
});
