import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/app/providers";
import { bodoniModa, inter, lato } from "@/app/fonts";

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
