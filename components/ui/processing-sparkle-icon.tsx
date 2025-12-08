'use client';

interface ProcessingSparkleIconProps {
    className?: string;
    color?: string;
}

export const ProcessingSparkleIcon = ({ className, color = '#1d4ed8' }: ProcessingSparkleIconProps) => {
    return (
        <>
            <div className={`relative ${className || 'w-8 h-8'}`}>
                {/* Sequential disappearing sparkles */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        animation: 'sparkle-sequential 3s ease-in-out infinite'
                    }}
                >
                    <path
                        d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
                        fill={color}
                    />
                </svg>
                <svg
                    className="absolute -top-1 -right-1 w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        animation: 'sparkle-sequential 3s ease-in-out infinite 0.5s'
                    }}
                >
                    <path
                        d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
                        fill={color}
                    />
                </svg>
                <svg
                    className="absolute bottom-1 -right-0.5 w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        animation: 'sparkle-sequential 3s ease-in-out infinite 1s'
                    }}
                >
                    <path
                        d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
                        fill={color}
                    />
                </svg>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes sparkle-sequential {
                        0% {
                            opacity: 1;
                            transform: scale(1);
                        }
                        
                        15% {
                            opacity: 1;
                            transform: scale(1);
                        }
                        
                        25% {
                            opacity: 0;
                            transform: scale(0.3);
                        }
                        
                        75% {
                            opacity: 0;
                            transform: scale(0.3);
                        }
                        
                        85% {
                            opacity: 1;
                            transform: scale(1);
                        }
                        
                        100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                `
            }} />
        </>
    );
};
