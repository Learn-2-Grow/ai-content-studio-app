'use client';

import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageRoute } from '@/enums/pageRoute.enum';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            router.push(PageRoute.DASHBOARD);
        }
    }, [router]);

    return (
        <main className="min-h-screen text-gray-900 flex flex-col items-center px-4 pt-8 md:pt-20">
            {/* Title Section */}
            <div className="text-center mb-12 md:mb-16 w-full">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
                    <span className="text-indigo-500">AI</span> Content Studio
                </h1>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-6xl mx-auto grid gap-12 md:grid-cols-[1.4fr_minmax(0,1fr)] items-center justify-items-center">

                {/* Left Section */}
                <section className="space-y-8 w-full max-w-xl mx-auto md:mx-0 text-center md:text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-600 shadow-sm">
                        <Sparkles className="h-3 w-3 text-sky-500" />
                        <span>AI Content Studio · Assessment</span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
                            Your AI-powered{" "}
                            <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
                                content assistant
                            </span>
                            .
                        </h1>
                        <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
                            Create blog posts, outlines, product descriptions, and social captions —
                            powered by async queues, dashboards, and sentiment analysis.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <Link href={PageRoute.LOGIN}>
                            <Button size="lg" className="gap-2">
                                <MessageCircle className="h-4 w-4" />
                                Login
                            </Button>
                        </Link>
                        <Link href={PageRoute.REGISTER}>
                            <Button variant="outline" size="lg" className="border-gray-300 text-gray-800 hover:bg-gray-100">
                                Register
                            </Button>
                        </Link>
                    </div>

                    {/* Feature badges */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 justify-center md:justify-start">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Bull Queue + Redis
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-sky-500" />
                            Google Gemini + OpenRouter
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            Sentiment Analysis
                        </div>
                    </div>
                </section>

                {/* Right Section → Card preview */}
                <section className="md:justify-self-end w-full max-w-sm mx-auto md:mx-0">
                    <Card className="border-gray-200 bg-white shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-base">
                                <span>Quick Preview</span>
                                <span className="text-[10px] rounded-full border border-gray-300 px-2 py-0.5 text-gray-500">
                                    Demo snapshot
                                </span>
                            </CardTitle>
                            <CardDescription className="text-xs text-gray-500">
                                A quick look at what your dashboard will show.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 text-xs">
                            {/* Total Threads */}
                            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
                                <div>
                                    <p className="text-[11px] text-gray-500">Total Contents</p>
                                    <p className="text-2xl font-semibold text-gray-900">27</p>
                                </div>
                                <div className="text-right text-[11px] text-gray-500">
                                    <p>Pending: <span className="text-amber-600 font-medium">3</span></p>
                                    <p>Failed: <span className="text-red-500 font-medium">1</span></p>
                                </div>
                            </div>

                            {/* Recent Threads */}
                            <div className="space-y-2">
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                    Recent Contents
                                </p>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 bg-white">
                                        <div>
                                            <p className="text-xs font-medium text-gray-900">EV Charging Basics</p>
                                            <p className="text-[11px] text-gray-500">Blog Post · Completed</p>
                                        </div>
                                        <span className="text-[11px] text-gray-400">2 min ago</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 bg-white">
                                        <div>
                                            <p className="text-xs font-medium text-gray-900">Winter Sale Promo</p>
                                            <p className="text-[11px] text-gray-500">Social Caption · Completed</p>
                                        </div>
                                        <span className="text-[11px] text-gray-400">10 min ago</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 bg-white">
                                        <div>
                                            <p className="text-xs font-medium text-gray-900">Untitled</p>
                                            <p className="text-[11px] text-amber-600">Blog Post · Pending…</p>
                                        </div>
                                        <span className="text-[11px] text-gray-400">Just now</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>Sign in to view your real data</span>
                            <Link href={PageRoute.DASHBOARD} className="inline-flex items-center gap-1 text-sky-600 hover:underline">
                                View dashboard
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </CardFooter>
                    </Card>
                </section>

            </div>
        </main>
    );
}
