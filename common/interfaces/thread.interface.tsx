export interface LastContent {
    _id: string;
    threadId: string;
    prompt: string;
    generatedContent: string;
    status: string;
    statusUpdatedAt: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
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

export interface Content {
    _id: string;
    threadId: string;
    prompt: string;
    generatedContent: string;
    status: string;
    statusUpdatedAt: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface ThreadDetails {
    _id: string;
    userId: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    contents: Content[];
}
