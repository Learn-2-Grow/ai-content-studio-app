'use client';

import { getContentTypeLabel, getThreadStatusLabel } from '@/common/helpers/content.helper';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DashboardSummaryProps {
    total: number;
    byType: Record<string, number>;
    status: Record<string, number>;
    loading?: boolean;
}

export default function DashboardSummary({ total, byType, status, loading = false }: DashboardSummaryProps) {
    if (loading) {
        return (
            <div className="space-y-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-full flex flex-col justify-between min-h-[100px] py-3">
                        <CardHeader>
                            <CardTitle className="text-base">Loading...</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-center pt-0 -mt-5">
                            <div className="text-3xl font-bold text-gray-300">-</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <Card className="h-full flex flex-col justify-between min-h-[100px] py-3 border-l-4 border-l-blue-300 bg-blue-50/20 hover:shadow-sm transition-shadow">
                <CardHeader className="">
                    <CardTitle className="text-base text-blue-500">Total Contents</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex items-center pt-0 -mt-5">
                    <div className="text-3xl font-bold text-blue-400">{total}</div>
                </CardContent>
            </Card>

            <Card className="h-full flex flex-col justify-between min-h-[100px] py-3 border-l-4 border-l-purple-300 bg-purple-50/20 hover:shadow-sm transition-shadow">
                <CardHeader className="">
                    <CardTitle className="text-base text-purple-500">By Type</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center space-y-2 text-sm pt-0 -mt-5">
                    {Object.entries(byType).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                            <span className="text-gray-700">{getContentTypeLabel(key)}</span>
                            <span className="font-semibold text-purple-400">{value}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="h-full flex flex-col justify-between min-h-[100px] py-3 border-l-4 border-l-green-300 bg-green-50/20 hover:shadow-sm transition-shadow">
                <CardHeader className="">
                    <CardTitle className="text-base text-green-500">Status</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center space-y-2 pt-0 -mt-5">
                    {Object.keys(status).length === 0 ? (
                        <div className="text-sm text-gray-500">No status data</div>
                    ) : (
                        Object.entries(status).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-700">{getThreadStatusLabel(key)}</span>
                                <span className="font-semibold text-green-400">{value}</span>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
