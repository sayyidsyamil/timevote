// /components/LandingPage.tsx

'use client';

import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'

export function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
            <div className="container mx-auto flex flex-col items-center justify-center space-y-12 text-center">
                <div className="flex items-center space-x-3">
                    <CalendarDays className="h-12 w-12 text-primary" />
                    <h1 className="text-4xl md:text-6xl font-bold">TimeVote</h1>
                </div>

                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
                    Find the perfect meeting time, effortlessly. Create a poll, share with participants,
                    and let the votes decide the best time for everyone.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <SignedOut>
                        <SignInButton>Sign In to Create a Timevote</SignInButton>                        
                    </SignedOut>

                    <SignedIn>
                        
                    <Link href="/create">
                            <Button size="lg" className="text-lg px-8">
                                Create New Poll
                            </Button>
                        </Link>
                    </SignedIn>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                    <FeatureCard
                        title="Easy Time Blocking"
                        description="Drag and click to block your unavailable times in a sleek, interactive calendar."
                    />
                    <FeatureCard
                        title="No Login Required"
                        description="Share a unique link with participants - they can vote instantly without signing up."
                    />
                    <FeatureCard
                        title="Real-time Results"
                        description="Watch as votes come in and see the most popular times highlighted automatically."
                    />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="p-6 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}
