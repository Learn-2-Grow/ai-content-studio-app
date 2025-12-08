import { Toaster } from '@/components/ui/sonner';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <div className='max-w-7xl mx-auto bg-white p-2'>
                <Component {...pageProps} />
                <Toaster />
            </div>
        </>
    );
}
