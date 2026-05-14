import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finanças do Casal",
  description: "Sistema de gestão financeira familiar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}