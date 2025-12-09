'use client';

import { ContentStatus } from '@/common/enums/content.enum';
import { PageRoute } from '@/common/enums/pageRoute.enum';
import { getContentTypeLabel, getThreadStatusClass, getThreadStatusLabel } from '@/common/helpers/content.helper';
import { Thread } from '@/common/interfaces/thread.interface';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProcessingSparkleIcon } from './ui/processing-sparkle-icon';

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

interface ThreadListProps {
    threads: Thread[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    onLoadMore: () => void;
}

export default function ThreadList({
    threads,
    loading,
    loadingMore,
    error,
    hasMore,
    onLoadMore,
}: ThreadListProps) {
    const router = useRouter();

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) {
        return <div className="text-center py-8 text-sm text-gray-500">Loading threads...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-sm text-red-500">{error}</div>;
    }

    if (threads.length === 0) {
        return <div className="text-center py-8 text-sm text-gray-500">No threads yet</div>;
    }

    return (
        <>
            <div className="space-y-2">
                {threads.map((thread) => {
                    const contentStatus = thread.lastContent?.status;
                    const contentStatusInfo = contentStatus ? contentStatusMap[contentStatus] : null;

                    return (
                        <div
                            key={thread._id}
                            className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-indigo-50/20 transition-colors rounded-md"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold text-sm text-gray-800">{thread.title}</div>
                                    {contentStatusInfo && (
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${contentStatusInfo.class}`}
                                        >
                                            {contentStatusInfo.icon}
                                            {contentStatusInfo.label}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {getContentTypeLabel(thread.type)} · {formatDate(thread.createdAt)}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs border ${getThreadStatusClass(thread.status)}`}
                                >
                                    {getThreadStatusLabel(thread.status)}
                                </span>
                                <button
                                    onClick={() => router.push(`${PageRoute.CONTENT_DETAILS}?id=${thread._id}`)}
                                    className="text-xs text-indigo-400 hover:text-indigo-500 font-medium hover:underline transition-colors"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {hasMore && (
                <div className="mt-4 text-center">
                    <button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        className="px-4 py-2 text-sm text-indigo-400 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed font-medium hover:bg-indigo-50/20 rounded-md transition-colors"
                    >
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </>
    );
}
