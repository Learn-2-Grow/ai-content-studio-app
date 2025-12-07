'use client';

import { authApi } from '@/Apis/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageRoute } from '@/enums/pageRoute.enum';
import { LoginResponse } from '@/types/login.types';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        api?: string;
    }>({});
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: {
            name?: string;
            email?: string;
            password?: string;
        } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response: LoginResponse = await authApi.register(
                formData.name,
                formData.email,
                formData.password
            );
            const accessToken = response?.tokens?.access ? response.tokens.access : '';
            const refreshToken = response?.tokens?.refresh ? response.tokens.refresh : '';

            if (accessToken && refreshToken) {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                toast.success('Registration successful');
                router.push(PageRoute.DASHBOARD);
            }
        } catch (error: any) {
            setErrors({
                api: error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-normal text-gray-900 mb-2">
                        Create your account
                    </h1>
                    <p className="text-sm text-gray-600">
                        Get started with your free account
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={errors.name ? 'border-red-500' : ''}
                                    autoComplete="name"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'border-red-500' : ''}
                                    autoComplete="email"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="text-xs text-gray-500">
                            By creating an account, you agree to our{' '}
                            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                                Privacy Policy
                            </Link>
                            .
                        </div>

                        {errors.api && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {errors.api}
                            </div>
                        )}

                        <div className="space-y-3">
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? 'Loading...' : 'Create account'}
                            </Button>

                            <div className="text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
