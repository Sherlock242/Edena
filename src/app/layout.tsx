import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Edena',
  description: 'An AI assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <Script type='text/javascript' src='//certainwolveshonestly.com/e3/6d/06/e36d068ab2ed1fe0979437ad7a7d4e6a.js' />
        <Script type='text/javascript' src='//certainwolveshonestly.com/15/a8/0e/15a80e7627074b2defc9f1024108d085.js' />
      </body>
    </html>
  );
}
