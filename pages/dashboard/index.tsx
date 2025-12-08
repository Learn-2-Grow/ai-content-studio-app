'use client';

import { threadsApi } from '@/Apis/threads';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessingSparkleIcon } from '@/components/ui/processing-sparkle-icon';
import { PageRoute } from '@/enums/pageRoute.enum';
import { ContentStatus, Thread, ThreadsSummaryResponse } from '@/types/thread.types';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


const typeMap: Record<string, string> = {
    blog_post: 'Blog Post',
    product_description: 'Product Description',
    social_media_caption: 'Social Media Caption',
    article: 'Article',
    other: 'Other',
    blog_outline: 'Blog Outline',
    social_caption: 'Social Caption',
};

const statusMap: Record<string, { label: string; class: string }> = {
    active: { label: 'Active', class: 'bg-green-50 text-green-700 border-green-200' },
    completed: { label: 'Completed', class: 'bg-green-50 text-green-700 border-green-200' },
    pending: { label: 'Pending', class: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    failed: { label: 'Failed', class: 'bg-red-50 text-red-700 border-red-200' },
    processing: { label: 'Processing', class: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const contentStatusMap: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
    [ContentStatus.PENDING]: {
        label: 'Pending',
        class: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: <Clock className="h-3 w-3" />,
    },
    [ContentStatus.PROCESSING]: {
        label: 'Processing',
        class: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <ProcessingSparkleIcon className="w-3 h-3" />,
    },
    [ContentStatus.COMPLETED]: {
        label: 'Completed',
        class: 'bg-green-50 text-green-700 border-green-200',
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    [ContentStatus.FAILED]: {
        label: 'Failed',
        class: 'bg-red-50 text-red-700 border-red-200',
        icon: <XCircle className="h-3 w-3" />,
    },
};

export default function DashboardPage() {
    const router = useRouter();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [totalThreads, setTotalThreads] = useState(0);
    const [summary, setSummary] = useState<ThreadsSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    useEffect(() => {
        fetchSummary();
        fetchThreads(true);
    }, [router]);

    const fetchSummary = async () => {
        try {
            setLoadingSummary(true);
            const summaryData = await threadsApi.getSummary();
            setSummary(summaryData);
        } catch (err: any) {
            console.error('Error fetching summary:', err);
        } finally {
            setLoadingSummary(false);
        }
    };

    const fetchThreads = async (reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
                setPage(1);
                setThreads([]);
            } else {
                setLoadingMore(true);
            }
            setError(null);

            const currentPage = reset ? 1 : page;
            const response = await threadsApi.getThreads(currentPage, pageSize);

            if (reset) {
                setThreads(response.data);
                setTotalThreads(response.total);
                setPage(2); // Next page to load
                setHasMore(response.data.length < response.total);
            } else {
                setThreads((prev) => {
                    const newThreads = [...prev, ...response.data];
                    setHasMore(newThreads.length < response.total);
                    return newThreads;
                });
                setTotalThreads(response.total);
                setPage((prev) => prev + 1);
            }
        } catch (err: any) {
            console.error('Error fetching threads:', err);
            setError(err.response?.data?.message || 'Failed to fetch threads');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchThreads(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };


    // Use summary data if available, otherwise fallback to calculated stats
    const stats = {
        total: summary?.totalThreads || totalThreads || threads.length,
        byType: summary?.threadsByType || threads.reduce((acc, thread) => {
            acc[thread.type] = (acc[thread.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        status: summary?.statusCounts || threads.reduce((acc, thread) => {
            acc[thread.status] = (acc[thread.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
    };

    return (
        <div className="min-h-screen py-6 px-4">
            <div className="max-w-7xl mx-auto">
                <PageHeader />

                <div className="flex flex-col gap-8">
                    <div className="space-y-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        <Card className="h-full flex flex-col justify-between min-h-[100px] py-3 border-l-4 border-l-blue-300 bg-blue-50/20 hover:shadow-sm transition-shadow">
                            <CardHeader className="">
                                <CardTitle className="text-base text-blue-500">Total Contents</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow flex items-center pt-0 -mt-5">
                                <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
                            </CardContent>
                        </Card>

                        <Card className="h-full flex flex-col justify-between min-h-[100px] py-3 border-l-4 border-l-purple-300 bg-purple-50/20 hover:shadow-sm transition-shadow">
                            <CardHeader className="">
                                <CardTitle className="text-base text-purple-500">By Type</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-center space-y-2 text-sm pt-0 -mt-5">
                                {Object.entries(stats.byType).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="text-gray-700">{typeMap[key] || key}</span>
                                        <span className="font-semibold text-purple-400">{value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="h-full flex flex-col justify-between min-h-[100px] py-3 border-l-4 border-l-green-300 bg-green-50/20 hover:shadow-sm transition-shadow">
                            <CardHeader className="">
                                <CardTitle className="text-base text-green-500">Status</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-center space-y-2 pt-0 -mt-5">
                                {Object.keys(stats.status).length === 0 ? (
                                    <div className="text-sm text-gray-500">No status data</div>
                                ) : (
                                    Object.entries(stats.status).map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-gray-700">{statusMap[key]?.label || key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                            <span className="font-semibold text-green-400">{value}</span>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="border-t-4 border-t-indigo-300 shadow-none">
                            <CardHeader className="flex justify-between items-center">
                                <CardTitle className="text-sm text-indigo-800 font-semibold">Recent Contents</CardTitle>
                                <Button variant="outline" size="sm" className="text-xs pointer-events-auto cursor-pointer bg-white hover:bg-indigo-50/30 border-indigo-200 text-indigo-800"
                                    onClick={() => router.push(`${PageRoute.CONTENT_DETAILS}?id=new-content`)}
                                >Create New Content</Button>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8 text-sm text-gray-500">Loading threads...</div>
                                ) : error ? (
                                    <div className="text-center py-8 text-sm text-red-500">{error}</div>
                                ) : threads.length === 0 ? (
                                    <div className="text-center py-8 text-sm text-gray-500">No threads yet</div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            {threads.map((thread) => {
                                                const contentStatus = thread.lastContent?.status;
                                                const contentStatusInfo = contentStatus ? contentStatusMap[contentStatus] : null;

                                                return (
                                                    <div key={thread._id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-indigo-50/20 transition-colors rounded-md">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-semibold text-sm text-gray-800">{thread.title}</div>
                                                                {contentStatusInfo && (
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${contentStatusInfo.class}`}>
                                                                        {contentStatusInfo.icon}
                                                                        {contentStatusInfo.label}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {typeMap[thread.type] || thread.type} · {formatDate(thread.createdAt)}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs border ${statusMap[thread.status]?.class || 'bg-gray-50 text-gray-700'}`}>
                                                                {statusMap[thread.status]?.label || thread.status}
                                                            </span>
                                                            <button
                                                                onClick={() => router.push(`${PageRoute.CONTENT_DETAILS}?id=${thread._id}`)}
                                                                className="text-xs text-indigo-400 hover:text-indigo-500 font-medium hover:underline transition-colors"
                                                            >View</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {hasMore && (
                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={handleLoadMore}
                                                    disabled={loadingMore}
                                                    className="px-4 py-2 text-sm text-indigo-400 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed font-medium hover:bg-indigo-50/20 rounded-md transition-colors"
                                                >
                                                    {loadingMore ? 'Loading...' : 'Load More'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
