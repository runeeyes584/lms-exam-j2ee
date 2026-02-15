import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduPlatform - Future of Learning",
  description: "All-in-one education ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
