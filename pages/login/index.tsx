'use client';

import { authApi } from '@/Apis/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageRoute } from '@/enums/pageRoute.enum';
import { setUser } from '@/helpers/user.helper';
import { LoginResponse } from '@/types/login.types';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
    const router = useRouter();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value?.trim() }));
        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

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
            const response: LoginResponse = await authApi.login(formData.email, formData.password);
            console.log("response", response);
            const accessToken = response?.tokens?.access ? response.tokens.access : '';
            const refreshToken = response?.tokens?.refresh ? response.tokens.refresh : '';

            if (accessToken && refreshToken) {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                setUser(response.user);

                // show success message
                toast.success('Login successful');
                router.push(PageRoute.DASHBOARD);
            }
        } catch (error: any) {
            setErrors({
                api: error.response?.data?.error || error.response?.data?.message || 'Login failed. Please try again.',
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
                        Sign in
                    </h1>
                    <p className="text-sm text-gray-600">
                        Use your account to continue
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
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
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                        autoComplete="current-password"
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

                        {/* <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-gray-600">Remember me</span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div> */}

                        {errors.api && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {errors.api}
                            </div>
                        )}

                        <div className="space-y-3">
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? 'Loading...' : 'Sign in'}
                            </Button>

                            <div className="text-center text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    href="/register"
                                    className="text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
