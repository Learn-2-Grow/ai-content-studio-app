'use client';

import { Button } from '@/components/ui/button';
import { PageRoute } from '@/enums/pageRoute.enum';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            router.push(PageRoute.DASHBOARD);
        }
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-6">
                <h1 className="text-4xl font-bold text-gray-900">Welcome</h1>
                <p className="text-lg text-gray-600">Get started by logging in or creating an account</p>
                <div className="flex gap-4 justify-center">
                    <Link href={PageRoute.LOGIN}>
                        <Button>Login</Button>
                    </Link>
                    <Link href={PageRoute.REGISTER}>
                        <Button variant="outline">Register</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
