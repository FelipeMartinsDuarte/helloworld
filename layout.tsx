
import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Corrected to match original working import
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/app-header';
import { LanguageProvider } from '@/contexts/language-context';

const geistSans = Geist({ // geistSans variable name is fine for instance
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FocusFlow',
  description: 'Manage your tasks and time with this Pomodoro timer.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased font-sans min-h-screen flex flex-col`} suppressHydrationWarning>
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AppHeader />
            <main className="flex-grow flex flex-col"> {/* main grows to fill space in body's flex column */}
              {children}
            </main>
            <Toaster />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
