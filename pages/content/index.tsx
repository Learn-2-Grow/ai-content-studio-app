'use client';

import { contentApi } from '@/Apis/content';
import { threadsApi } from '@/Apis/threads';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { ProcessingSparkleIcon } from '@/components/ui/processing-sparkle-icon';
import appConfig from '@/config/app.config';
import { PageRoute } from '@/enums/pageRoute.enum';
import { getUser } from '@/helpers/user.helper';
import { ContentType } from '@/enums/content.enum';
import { Content, ThreadDetails } from '@/types/thread.interface';
import { getContentTypeLabel } from '@/helpers/content.helper';
import { ArrowLeft, Send } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';


const contentTypeOptions = [
    { value: ContentType.BLOG_POST, label: getContentTypeLabel(ContentType.BLOG_POST) },
    { value: ContentType.PRODUCT_DESCRIPTION, label: getContentTypeLabel(ContentType.PRODUCT_DESCRIPTION) },
    { value: ContentType.SOCIAL_MEDIA_CAPTION, label: getContentTypeLabel(ContentType.SOCIAL_MEDIA_CAPTION) },
    { value: ContentType.ARTICLE, label: getContentTypeLabel(ContentType.ARTICLE) },
    { value: ContentType.OTHER, label: getContentTypeLabel(ContentType.OTHER) },
];

export default function ContentDetailsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const threadId = searchParams.get('id') || 'new-content';
    const isNewContent = threadId === 'new-content';

    const [threadDetails, setThreadDetails] = useState<ThreadDetails | null>(null);
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(!isNewContent);
    const [generating, setGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [contentType, setContentType] = useState(ContentType.BLOG_POST);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const user = getUser();
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const url = `${appConfig.ACS_Endpoint}/sse/stream?userId=${encodeURIComponent(user?._id || '')}`;
        // send access token in the headers
        const es = new EventSource(url);

        es.onopen = () => {
            setConnected(true);
            console.log('SSE connected');
        };

        es.onmessage = (ev) => {
            try {
                try {
                    const parsedContent: Content = JSON.parse(ev.data);
                    console.log("SSE message", parsedContent);

                    const contentId = parsedContent?._id ?? null;
                    const contentStatus = parsedContent?.status ?? null;
                    const generatedContent = parsedContent?.generatedContent ?? null;

                    console.log({
                        contentId,
                        contentStatus,
                        generatedContent
                    })

                    if (!contentId || !contentStatus || !generatedContent) {
                        // Handle error if any required field is missing
                        console.warn("SSE message missing required fields", parsedContent);
                        return;
                    }

                    setContents(prevContents => {
                        const contentIndex = prevContents.findIndex(c => c._id === contentId);
                        if (contentIndex === -1) {
                            // Optionally, handle if the content does not exist (e.g., push new or do nothing)
                            return prevContents;
                        }
                        // Create a shallow copy and update the relevant content
                        const updatedContents = [...prevContents];
                        updatedContents[contentIndex] = {
                            ...updatedContents[contentIndex],
                            generatedContent,
                            status: contentStatus
                        };
                        return updatedContents;
                    });
                } catch (err) {
                    console.error('Failed to parse SSE data', err);
                    toast.error('Failed to process streaming content update.');
                }
            } catch (err) {
                console.error('Failed to parse SSE data', err);
            }
        };

        es.onerror = (err) => {
            console.error('SSE error', err);
            // Optionally close on fatal errors:
            // es.close();
            setConnected(false);
        };

        return () => {
            es.close();
            setConnected(false);
        };
    }, [user?._id]);

    useEffect(() => {
        if (!isNewContent) {
            fetchThreadDetails();
        }
    }, [threadId, isNewContent]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [contents, generating]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [prompt]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!generating && prompt.trim()) {
                handleGenerate();
            }
        }
    };

    const fetchThreadDetails = async () => {
        try {
            setLoading(true);
            const details = await threadsApi.getThreadDetails(threadId);
            setThreadDetails(details);
            setContents(details.contents || []);
        } catch (err: any) {
            toast.error(err.userMessage || 'Failed to load thread details');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        if (isNewContent && !contentType) {
            toast.error('Please select a content type');
            return;
        }

        try {
            setGenerating(true);
            const response = await contentApi.generateContent({
                prompt: prompt.trim(),
                contentType: isNewContent ? contentType : threadDetails?.type || 'blog_post',
                threadId: isNewContent ? null : threadId,
            });

            if (isNewContent) {
                toast.success('Content generated successfully');
                router.push(`${PageRoute.CONTENT_DETAILS}?id=${response._id}`);
            } else {
                if (response.lastContent) {
                    setContents((prev) => [...prev, response.lastContent as Content]);
                }
                setPrompt('');
            }
        } catch (err: any) {
            toast.error(err.userMessage || 'Failed to generate content');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen  flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <PageHeader />


            {/* Content Details Header */}
            <div className="border-b bg-white px-4 py-3 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(PageRoute.DASHBOARD)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                {!isNewContent && threadDetails ? (
                    <div className="flex-1">
                        <h1 className="text-sm font-semibold">{threadDetails.title}</h1>
                        <p className="text-xs text-gray-500">{getContentTypeLabel(threadDetails.type)}</p>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm font-semibold">New Conversation</span>
                        <select
                            value={contentType}
                            onChange={(e) => setContentType(e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {contentTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    {contents.length === 0 && !generating && (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm mt-10">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <p>
                                    How can I help you today?
                                </p>
                                <p className="text-xs text-gray-500">
                                    Ask anything and I will help you generate content
                                </p>                            </div>
                        </div>
                    )}

                    {contents.map((content) => (
                        <div key={content._id} className="mb-8">
                            <div className="flex justify-end mb-4">
                                <div className="max-w-[85%]">
                                    <div className="bg-gray-200 rounded-2xl px-4 py-3">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{content.prompt}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-start">
                                <div className="max-w-[85%]">
                                    {content.generatedContent ? (
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                            {content.generatedContent}
                                        </p>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <ProcessingSparkleIcon className="w-4 h-4" color="#9ca3af" />
                                            <span>Generating...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {generating && (
                        <div className="mb-8">
                            <div className="flex justify-end mb-4">
                                <div className="max-w-[85%]">
                                    <div className="bg-gray-200 rounded-2xl px-4 py-3">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{prompt}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-start">
                                <div className="max-w-[85%]">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <ProcessingSparkleIcon className="w-4 h-4" color="#9ca3af" />
                                        <span>Generating response...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div >

            <div className="border-t bg-white px-4 py-3">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-2">

                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything"
                                rows={1}
                                disabled={generating}
                                className="w-full resize-none rounded-lg border-0 bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ minHeight: '48px', maxHeight: '200px' }}
                            />
                        </div>
                        <Button
                            onClick={handleGenerate}
                            disabled={generating || !prompt.trim()}
                            size="sm"
                            className="h-10 w-10 rounded-lg flex items-center justify-center p-0 flex-shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    );
}
