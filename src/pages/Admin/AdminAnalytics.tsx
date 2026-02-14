import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatsCard } from "@/components/admin/StatsCard";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { Activity, ClipboardList, Route, ShieldCheck, Truck, Timer, Brain } from "lucide-react";
import { useAdminData } from "@/context/AdminDataContext";
import { useLogisticsControl } from "@/context/LogisticsControlContext";

export default function AdminAnalytics() {
  const { analytics } = useAdminData();
  const { predictiveEtas } = useLogisticsControl();
  const avgConfidence =
    predictiveEtas.length > 0
      ? Number(
          (
            predictiveEtas.reduce((sum, item) => sum + item.confidencePct, 0) / predictiveEtas.length
          ).toFixed(1)
        )
      : 0;
  const highRiskForecasts = predictiveEtas.filter((item) => item.riskLevel === "High").length;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Operations Intelligence</h1>
          <p className="text-muted-foreground">
            End-to-end performance across requests, orders, customs, delivery, and ETA risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Customer Requests"
            value={analytics.totalRequests.toLocaleString()}
            icon={ClipboardList}
            trend={{ value: 7.1, isPositive: true }}
          />
          <StatsCard
            title="Request Conversion"
            value={`${analytics.requestConversionRate}%`}
            icon={Route}
            trend={{ value: 2.4, isPositive: true }}
          />
          <StatsCard
            title="Request Backlog"
            value={analytics.requestBacklog}
            icon={Activity}
            trend={{ value: 1.2, isPositive: false }}
          />
          <StatsCard
            title="On-Time Delivery"
            value={`${analytics.onTimeRate}%`}
            icon={Timer}
            trend={{ value: 1.9, isPositive: true }}
          />
          <StatsCard
            title="Customs Holds"
            value={analytics.customsHolds}
            icon={ShieldCheck}
            trend={{ value: 0.8, isPositive: false }}
          />
          <StatsCard
            title="Fleet Utilization"
            value={`${analytics.fleetUtilization}%`}
            icon={Truck}
            trend={{ value: 3.6, isPositive: true }}
          />
          <StatsCard
            title="Avg ETA Confidence"
            value={`${avgConfidence}%`}
            icon={Brain}
            trend={{ value: 2.1, isPositive: true }}
          />
          <StatsCard
            title="High-Risk Forecasts"
            value={highRiskForecasts}
            icon={Activity}
            trend={{ value: 1.5, isPositive: false }}
          />
        </div>

        <AnalyticsCharts data={analytics} />
      </main>
    </div>
  );
}
