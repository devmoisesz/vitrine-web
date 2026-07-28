import { Bodoni_Moda, Inter, Lato } from "next/font/google";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/app/providers";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-serif",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Vitrine Web",
  description: "Marketplace de lojas locais.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${bodoniModa.variable} ${inter.variable} ${lato.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
