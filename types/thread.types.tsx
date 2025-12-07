export interface LastContent {
    _id: string;
    threadId: string;
    status: string;
    statusUpdatedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface Thread {
    _id: string;
    userId: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    lastContent?: LastContent;
}

export enum ContentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export interface ThreadsResponse {
    data: Thread[];
    total: number;
    currentPage: number;
    pageSize: number;
}

export interface ThreadsSummaryResponse {
    totalThreads: number;
    threadsByType: Record<string, number>;
    statusCounts: Record<string, number>;
}
