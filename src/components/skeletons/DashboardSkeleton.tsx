import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Summary Cards Skeleton */}
            <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[120px] mb-2" />
                            <Skeleton className="h-3 w-[150px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row Skeleton */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="glass-card h-[400px]">
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px]" />
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[300px]">
                        <Skeleton className="h-[250px] w-full rounded-lg" />
                    </CardContent>
                </Card>
                <Card className="glass-card h-[400px]">
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px]" />
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[300px]">
                        <Skeleton className="h-[250px] w-[250px] rounded-full" />
                    </CardContent>
                </Card>
            </div>

            {/* Insights Skeleton */}
            <Card className="glass-card">
                <CardHeader>
                    <Skeleton className="h-6 w-[200px]" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                </CardContent>
            </Card>
        </div>
    );
};
