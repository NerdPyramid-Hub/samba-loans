"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MonthlyData {
  month: string;
  paidLoans: number;
  unpaidLoans: number;
}

interface AdminAnalyticsProps {
  monthlyData: MonthlyData[];
}

export function AdminAnalytics({ monthlyData }: AdminAnalyticsProps) {
  // Memoize the chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => monthlyData || [], [monthlyData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Loan Performance</CardTitle>
          <CardDescription>
            Comparison of paid vs unpaid loans by month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `R${value.toLocaleString()}`,
                  name,
                ]}
              />
              <Legend />
              <Bar dataKey="paidLoans" fill="#10b981" name="Paid Loans" />
              <Bar dataKey="unpaidLoans" fill="#f59e0b" name="Unpaid Loans" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
