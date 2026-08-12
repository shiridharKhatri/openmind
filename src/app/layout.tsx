import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'OpenMind — Uncensored AI Assistant',
  description: 'A fully uncensored, private AI assistant running locally on your hardware. No filters, no restrictions, no data collection. Your mind, your rules.',
  keywords: ['AI', 'uncensored', 'private', 'local', 'assistant', 'chat', 'Ollama', 'LLM', 'no censorship'],
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body className="font-sans antialiased m-0 p-0 w-full min-h-screen">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
