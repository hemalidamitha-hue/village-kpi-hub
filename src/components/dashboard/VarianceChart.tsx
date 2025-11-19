import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

interface VarianceChartProps {
  department?: string | null;
}

const VarianceChart = ({ department }: VarianceChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVarianceData();
  }, [department]);

  const fetchVarianceData = async () => {
    try {
      let query = supabase
        .from("kpi_records")
        .select("*")
        .order("entry_date", { ascending: false })
        .limit(10);

      if (department) {
        query = query.eq("department", department as any);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedData = data.reverse().map((record) => ({
          date: new Date(record.entry_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          // expected_defects is stored as a percentage, defect_percentage is the actual percentage
          expected: Number(record.expected_defects ?? 0),
          actual: Number(record.defect_percentage ?? 0),
          variance: Number(record.variance ?? 0),
        }));
        setChartData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching variance data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    expected: {
      label: "Expected Defects (%)",
      color: "hsl(var(--primary))",
    },
    actual: {
      label: "Actual Defects (%)",
      color: "hsl(var(--destructive))",
    },
    variance: {
      label: "Variance (pp)",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expected vs Actual Defects - Variance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available. Submit KPI records to see the variance chart.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="expected" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="Expected Defects (%)"
                />
                <Bar 
                  dataKey="actual" 
                  fill="hsl(var(--destructive))" 
                  radius={[4, 4, 0, 0]}
                  name="Actual Defects (%)"
                />
                <Bar 
                  dataKey="variance" 
                  fill="hsl(var(--accent))" 
                  radius={[4, 4, 0, 0]}
                  name="Variance (percentage points)"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default VarianceChart;
