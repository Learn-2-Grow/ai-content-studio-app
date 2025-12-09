'use client';

import { threadsApi } from '@/apis/threads';
import { ContentType, ThreadStatus } from '@/common/enums/content.enum';
import { PageRoute } from '@/common/enums/pageRoute.enum';
import { getContentTypeLabel, getThreadStatusLabel } from '@/common/helpers/content.helper';
import { Thread, ThreadsSummaryResponse } from '@/common/interfaces/thread.interface';
import DashboardSummary from '@/components/DashboardSummary';
import PageHeader from '@/components/PageHeader';
import ThreadList from '@/components/ThreadList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pageSize = 10;

    const isInitialMount = useRef(true);

    useEffect(() => {
        fetchSummary();
        fetchThreads(true);
        isInitialMount.current = false;
    }, [router]);

    // Debounce search query
    useEffect(() => {
        if (isInitialMount.current) return;

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            fetchThreads(true);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Reset 
    useEffect(() => {
        if (isInitialMount.current) return;
        fetchThreads(true);
    }, [selectedType, selectedStatus]);

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
            const search = searchQuery.trim() || undefined;
            const type = selectedType || undefined;
            const status = selectedStatus || undefined;

            const response = await threadsApi.getThreads(currentPage, pageSize, search, type, status);

            if (reset) {
                setThreads(response.data);
                setTotalThreads(response.total);
                setPage(2);
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

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedType('');
        setSelectedStatus('');
    };

    const hasActiveFilters = searchQuery.trim() || selectedType || selectedStatus;



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
                    <DashboardSummary
                        total={stats.total}
                        byType={stats.byType}
                        status={stats.status}
                        loading={loadingSummary}
                    />

                    <div className="lg:col-span-2">
                        <Card className="border-t-4 border-t-indigo-300 shadow-none">
                            <CardHeader className="flex justify-between items-center">
                                <CardTitle className="text-sm text-indigo-800 font-semibold">Recent Contents</CardTitle>
                                <Button variant="outline" size="sm" className="text-xs pointer-events-auto cursor-pointer bg-white hover:bg-indigo-50/30 border-indigo-200 text-indigo-800"
                                    onClick={() => router.push(`${PageRoute.CONTENT_DETAILS}?id=new-content`)}
                                >Create New Content</Button>
                            </CardHeader>
                            <CardContent>
                                {/* Search and Filter Section */}
                                <div className="mb-6 space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search by title..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 pr-10"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Filter Dropdowns */}
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <div className="flex-1 min-w-[150px] relative">
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="w-full h-9 rounded-md border border-gray-300 bg-white pl-3 pr-12 py-1 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                                            >
                                                <option value="">All Types</option>
                                                {Object.values(ContentType).map((type: ContentType) => (
                                                    <option key={type} value={type}>
                                                        {getContentTypeLabel(type.toString())}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        <div className="flex-1 min-w-[150px] relative">
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="w-full h-9 rounded-md border border-gray-300 bg-white pl-3 pr-12 py-1 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                                            >
                                                <option value="">All Statuses</option>
                                                {Object.values(ThreadStatus).map((status: ThreadStatus) => (
                                                    <option key={status} value={status}>
                                                        {getThreadStatusLabel(status.toString())}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        {hasActiveFilters && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleClearFilters}
                                                className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                                            >
                                                <X className="h-3 w-3 mr-1" />
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <ThreadList
                                    threads={threads}
                                    loading={loading}
                                    loadingMore={loadingMore}
                                    error={error}
                                    hasMore={hasMore}
                                    onLoadMore={handleLoadMore}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
