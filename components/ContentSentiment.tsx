'use client';

import { contentApi } from '@/apis/content';
import { sentimentApi } from '@/apis/sentiment';
import { ContentType } from '@/common/enums/content.enum';
import { SentimentType } from '@/common/enums/sentimentType.enum';
import { Content, ThreadDetails } from '@/common/interfaces/thread.interface';
import { Button } from '@/components/ui/button';
import { Frown, Meh, RefreshCw, Smile } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export type Sentiment = 'positive' | 'neutral' | 'negative' | null;

const SENTIMENT_CONFIG = {
    positive: { icon: Smile, label: 'Positive', className: 'text-green-600 bg-green-50 border-green-200' },
    neutral: { icon: Meh, label: 'Neutral', className: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    negative: { icon: Frown, label: 'Negative', className: 'text-red-600 bg-red-50 border-red-200' },
};

interface ContentSentimentProps {
    content: Content;
    threadDetails: ThreadDetails;
    isLastContent: boolean;
    onCreateContent: (
        obj?: {
            sentiment: SentimentType | null
            prompt: string
            contentType: ContentType
            threadId: string,
            regenerate: boolean
        }
    ) => Promise<void>;
}

export default function ContentSentiment({
    content,
    threadDetails,
    isLastContent,
    onCreateContent,
}: ContentSentimentProps) {
    const [sentiment, setSentiment] = useState<Sentiment>((content.sentiment as Sentiment) || null);
    const [feedback, setFeedback] = useState(content.feedback || '');
    const [submitting, setSubmitting] = useState(false);
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);
    const [showRegeneratePrompt, setShowRegeneratePrompt] = useState(false);

    if (content.status !== 'completed') return null;

    const hasSentiment = sentiment && ['positive', 'neutral', 'negative'].includes(sentiment);

    // Show read-only sentiment for non-last items
    if (!isLastContent) {
        const displaySentiment = (hasSentiment ? sentiment : 'neutral') as 'positive' | 'neutral' | 'negative';
        const config = SENTIMENT_CONFIG[displaySentiment];
        if (!config) return null;

        const { icon: Icon, label, className } = config;
        return (
            <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-gray-500">Feedback:</span>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${className}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{label}</span>
                </div>
            </div>
        );
    }

    // Handle last content with sentiment - show read-only badge with regeneration option if negative
    if (isLastContent && hasSentiment) {
        const displaySentiment = sentiment as 'positive' | 'neutral' | 'negative';
        const config = SENTIMENT_CONFIG[displaySentiment];
        if (!config) return null;

        const { icon: Icon, label, className } = config;

        return (
            <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Feedback:</span>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${className}`}>
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{label}</span>
                    </div>
                </div>

                {sentiment === 'negative' && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-xs text-red-700 flex-1">Could you please regenerate again?</p>
                        <Button
                            onClick={async () => {
                                try {
                                    setSubmitting(true);
                                    await onCreateContent({
                                        sentiment: SentimentType.NEGATIVE as SentimentType,
                                        prompt: content.prompt,
                                        contentType: threadDetails.type as ContentType,
                                        threadId: threadDetails._id,
                                        regenerate: true
                                    });
                                    toast.success('Content regenerated successfully');
                                } catch (error: any) {
                                    toast.error(error.userMessage || 'Failed to regenerate content');
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                            disabled={submitting}
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 text-xs border-red-300 text-red-600 hover:bg-red-100"
                        >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Yes
                        </Button>
                        <Button
                            onClick={() => { }}
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 text-xs border-gray-300 text-gray-600 hover:bg-gray-100"
                        >
                            No
                        </Button>
                    </div>
                )}
            </div>
        );
    }


    // Regenerate
    const handleRegenerate = async () => {
        try {
            setSubmitting(true);
            await onCreateContent({
                sentiment: SentimentType.NEGATIVE as SentimentType,
                prompt: content.prompt,
                contentType: threadDetails.type as ContentType,
                threadId: threadDetails._id,
                regenerate: true
            });
            toast.success('Content regenerated successfully');
        } catch (error: any) {
            toast.error(error.userMessage || 'Failed to regenerate content');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle sentiment button clicks
    const handleSentimentClick = async (newSentiment: Sentiment) => {
        const previousSentiment = sentiment;
        const finalSentiment = sentiment === newSentiment ? null : newSentiment;
        setSentiment(finalSentiment);

        try {
            setSubmitting(true);
            await contentApi.updateContent(content._id, { sentiment: finalSentiment });
        } catch (error: any) {
            toast.error(error.userMessage || 'Failed to save sentiment');
            setSentiment(previousSentiment);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle feedback
    const handleFeedbackSubmit = async () => {
        if (!feedback.trim()) {
            setShowFeedbackInput(false);
            return;
        }

        const feedbackText = feedback.trim().toLowerCase();
        const isSentimentWord = ['positive', 'neutral', 'negative'].includes(feedbackText);

        try {
            setSubmitting(true);
            if (isSentimentWord) {
                // Direct sentiment update
                const sentimentValue = feedbackText as 'positive' | 'neutral' | 'negative';
                await contentApi.updateContent(content._id, { sentiment: sentimentValue });
                setSentiment(sentimentValue);
                toast.success('Sentiment updated successfully');
            } else {
                // Analyze feedback 
                const response = await sentimentApi.sentimentAnalysis(content._id, feedback.trim());
                if (response.sentiment) {
                    await contentApi.updateContent(content._id, { sentiment: response.sentiment });
                    setSentiment(response.sentiment as Sentiment);
                }
                toast.success('Feedback submitted successfully');
            }
            setFeedback('');
            setShowFeedbackInput(false);
        } catch (error: any) {
            toast.error(error.userMessage || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };


    const renderSentimentButton = (type: 'positive' | 'neutral' | 'negative') => {
        const { icon: Icon } = SENTIMENT_CONFIG[type];
        const isActive = sentiment === type;
        const colors = {
            positive: isActive ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-green-300 text-green-600 hover:bg-green-50',
            neutral: isActive ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'border-yellow-300 text-yellow-600 hover:bg-yellow-50',
            negative: isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'border-red-300 text-red-600 hover:bg-red-50',
        };

        return (
            <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSentimentClick(type)}
                disabled={submitting}
                className={`h-7 px-2 ${colors[type]}`}
            >
                <Icon className="h-3.5 w-3.5" />
            </Button>
        );
    };

    return (
        <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Feedback:</span>
                <div className="flex items-center gap-1">
                    {renderSentimentButton('positive')}
                    {renderSentimentButton('neutral')}
                    {renderSentimentButton('negative')}
                </div>
                <button
                    onClick={() => setShowFeedbackInput(!showFeedbackInput)}
                    className="text-xs text-gray-500 hover:text-gray-700 ml-2"
                >
                    {showFeedbackInput ? 'Cancel' : 'Add feedback'}
                </button>
            </div>

            {showFeedbackInput && (
                <div className="space-y-2">
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your thoughts or type 'positive', 'neutral', or 'negative'..."
                        rows={2}
                        className="w-full text-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                    <Button onClick={handleFeedbackSubmit} disabled={submitting || !feedback.trim()} size="sm" variant="outline" className="h-7 text-xs">
                        Submit
                    </Button>
                </div>
            )}

            {sentiment === 'negative' && showRegeneratePrompt && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-700 flex-1">Could you please regenerate again?</p>
                    <Button
                        onClick={handleRegenerate}
                        disabled={submitting}
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs border-red-300 text-red-600 hover:bg-red-100"
                    >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Yes
                    </Button>
                    <Button onClick={() => setShowRegeneratePrompt(false)} size="sm" variant="outline" className="h-7 px-3 text-xs border-gray-300 text-gray-600 hover:bg-gray-100">
                        No
                    </Button>
                </div>
            )}
        </div>
    );
}
