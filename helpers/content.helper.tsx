import { ContentType, ThreadStatus } from '@/enums/content.enum';

export const getContentTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
        [ContentType.BLOG_POST]: 'Blog Post',
        [ContentType.PRODUCT_DESCRIPTION]: 'Product Description',
        [ContentType.SOCIAL_MEDIA_CAPTION]: 'Social Media Caption',
        [ContentType.ARTICLE]: 'Article',
        [ContentType.OTHER]: 'Other',
        blog_outline: 'Blog Outline',
        social_caption: 'Social Caption',
    };
    return typeLabels[type] || type;
};

export const getThreadStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
        [ThreadStatus.ACTIVE]: 'Active',
        [ThreadStatus.ARCHIVED]: 'Archived',
        [ThreadStatus.DELETED]: 'Deleted',
        completed: 'Completed',
        pending: 'Pending',
        failed: 'Failed',
        processing: 'Processing',
    };
    return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

export const getThreadStatusClass = (status: string): string => {
    const statusClasses: Record<string, string> = {
        [ThreadStatus.ACTIVE]: 'bg-green-50 text-green-700 border-green-200',
        [ThreadStatus.ARCHIVED]: 'bg-gray-50 text-gray-700 border-gray-200',
        [ThreadStatus.DELETED]: 'bg-red-50 text-red-700 border-red-200',

    };
    return statusClasses[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};
