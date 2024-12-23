// app/layout.tsx
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import './globals.css';
import { Button } from '@/components/ui/button';
import { HiOutlineCalendarDays } from 'react-icons/hi2';
import Link from 'next/link';

export const metadata = {
  title: 'TimeVote',
  description: 'Your Polling Platform',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: ['/cover.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/cover.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header className="p-4 bg-white text-black font-semibold grid grid-cols-3 items-center shadow-md">
            {/* Left Section: Logo */}
            <div className="flex items-center space-x-2">
              <HiOutlineCalendarDays className="w-10 h-10 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">TimeVote</h1>
            </div>

            {/* Center Section: Navigation Buttons */}
            <div className="flex justify-center space-x-4">
              <SignedIn>
                <Link href="/create">
                  <Button className="bg-white text-black font-semibold border border-primary/60 px-4 py-2 rounded-md hover:bg-primary hover:text-white hover:scale-105 transition-all">
                    Create New Poll
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="bg-white text-black font-semibold border border-primary/60 px-4 py-2 rounded-md hover:bg-primary hover:text-white hover:scale-105 transition-all">
                    Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>

            {/* Right Section: Auth Buttons */}
            <div className="flex justify-end space-x-4">
              <SignedOut>
                <SignInButton>
                  <Button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-all">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>

          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
