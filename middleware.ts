// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Allow access to the voting page even if not logged in
    '/poll/:id', // This ensures the poll page can be accessed anonymously

    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    // Always run for API routes (unless you want to exclude specific ones)
    '/(api|trpc)(.*)',

    // Optionally, you can include other routes or exclude certain ones as needed
  ],
};
