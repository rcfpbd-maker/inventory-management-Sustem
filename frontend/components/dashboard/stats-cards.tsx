import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFetchData } from "@/hooks/useFetchData";
import { reportApi } from "@/api/endpoint/report-api";

interface StatsData {
  totalSales: number;
  pendingOrdersCount: number;
  totalCustomers: number;
  salesGrowth: string;
  growthTrend: "up" | "down";
}

export function StatsCards() {
  const { data, isLoading } = useFetchData<StatsData>({
    url: reportApi.DASHBOARD_STATS,
  });

  if (isLoading) {
    return (
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-32 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Delivered Sales Revenue",
      value: `৳${Number(data?.totalSales || 0).toLocaleString()}`,
      change: data?.salesGrowth || "0%",
      trend: data?.growthTrend || "up",
    },
    {
      title: "Total Customers",
      value: (data?.totalCustomers || 0).toString(),
      change: "+0%",
      trend: "up" as const,
    },
    {
      title: "Pending Orders",
      value: (data?.pendingOrdersCount || 0).toString(),
      change: "Waitlist",
      trend: "down" as const,
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-0"
        >
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between space-x-2">
              <span className="text-muted-foreground truncate text-sm">
                {stat.title}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  stat.trend === "up"
                    ? "text-emerald-700 dark:text-emerald-500"
                    : "text-red-700 dark:text-red-500"
                )}
              >
                {stat.change}
              </span>
            </div>
            <dd className="text-foreground mt-1 text-3xl font-semibold">
              {stat.value}
            </dd>
          </CardContent>
          <CardFooter className="items-center px-6 [.border-t]:pt-6 border-border flex justify-end border-t p-0!">
            <Link
              className="text-primary hover:text-primary/90 flex items-center px-6 py-3 text-sm font-medium"
              href={stat.title === "Pending Orders" ? "/orders?status=PENDING" : "#"}
            >
              View more <ArrowRight className="ms-2 size-4" />
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
