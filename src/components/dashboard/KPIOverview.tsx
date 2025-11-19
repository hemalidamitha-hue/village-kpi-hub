import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Target } from "lucide-react";

interface KPIStats {
  totalProducts: number;
  actualDefects: number;
  expectedDefects: number;
  actualDefectsPercentage: number;
  expectedDefectsPercentage: number;
  defectsGap: number;
  percentageGap: number;
}

interface KPIOverviewProps {
  department?: string | null;
}

const KPIOverview = ({ department }: KPIOverviewProps) => {
  const [stats, setStats] = useState<KPIStats>({
    totalProducts: 0,
    actualDefects: 0,
    expectedDefects: 0,
    actualDefectsPercentage: 0,
    expectedDefectsPercentage: 0,
    defectsGap: 0,
    percentageGap: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIData();
  }, [department]);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("kpi_records")
        .select("*")
        .order("entry_date", { ascending: false });

      if (department) {
        query = query.eq("department", department as any);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        // Use only the latest KPI record (most recent entry_date)
        const latestRecord = data[0];

        const totalProduction = latestRecord.total_production;
        const totalActual = latestRecord.actual_defects;

        // expected_defects is stored as a percentage value
        const expectedPercentage = Number(latestRecord.expected_defects) || 0;
        const expectedDefectsCount =
          totalProduction > 0 ? (totalProduction * expectedPercentage) / 100 : 0;

        const actualPercentage =
          totalProduction > 0 ? (totalActual / totalProduction) * 100 : 0;

        setStats({
          totalProducts: totalProduction,
          actualDefects: totalActual,
          expectedDefects: expectedDefectsCount,
          actualDefectsPercentage: actualPercentage,
          expectedDefectsPercentage: expectedPercentage,
          defectsGap: totalActual - expectedDefectsCount,
          percentageGap: actualPercentage - expectedPercentage,
        });
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceStatus = (percentage: number) => {
    if (percentage <= 80) return { color: "performance-excellent", label: "Excellent" };
    if (percentage <= 100) return { color: "performance-good", label: "Good" };
    return { color: "performance-critical", label: "Critical" };
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const actualStatus = getPerformanceStatus(
    stats.expectedDefects > 0 ? (stats.actualDefects / stats.expectedDefects) * 100 : 0
  );

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formatNumber(stats.totalProducts)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Expected defects baseline</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expected Defects
            </CardTitle>
            <Target className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formatNumber(stats.expectedDefects)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(stats.expectedDefectsPercentage)} of total
            </p>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow border-l-4 border-l-${actualStatus.color}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actual Defects
            </CardTitle>
            <AlertTriangle className={`w-4 h-4 text-${actualStatus.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formatNumber(stats.actualDefects)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(stats.actualDefectsPercentage)} of total
            </p>
            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium bg-${actualStatus.color}/10 text-${actualStatus.color}`}>
              {actualStatus.label}
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow border-l-4 ${
          stats.defectsGap > 0 ? 'border-l-danger' : 'border-l-success'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Defects Gap
            </CardTitle>
            {stats.defectsGap > 0 ? (
              <TrendingUp className="w-4 h-4 text-danger" />
            ) : (
              <TrendingDown className="w-4 h-4 text-success" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              stats.defectsGap > 0 ? 'text-danger' : 'text-success'
            }`}>
              {stats.defectsGap > 0 ? '+' : ''}{formatNumber(stats.defectsGap)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Actual vs Expected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Percentage Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Percentage Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expected Defects %</span>
                <span className="font-semibold text-accent">
                  {formatPercentage(stats.expectedDefectsPercentage)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${Math.min(stats.expectedDefectsPercentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Actual Defects %</span>
                <span className={`font-semibold text-${actualStatus.color}`}>
                  {formatPercentage(stats.actualDefectsPercentage)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full bg-${actualStatus.color} transition-all duration-500`}
                  style={{ width: `${Math.min(stats.actualDefectsPercentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stats.percentageGap > 0 ? (
                <TrendingUp className="w-5 h-5 text-danger" />
              ) : (
                <TrendingDown className="w-5 h-5 text-success" />
              )}
              Percentage Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className={`text-5xl font-bold mb-2 ${
                  stats.percentageGap > 0 ? 'text-danger' : 'text-success'
                }`}>
                  {stats.percentageGap > 0 ? '+' : ''}{formatPercentage(Math.abs(stats.percentageGap))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Difference between actual and expected defect percentages
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                {stats.percentageGap > 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-danger/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-danger">
                      <p className="font-medium">Action Required</p>
                      <p className="mt-1 opacity-90">
                        Actual defects exceed expected levels. Review processes and implement corrective actions.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-success">
                      <p className="font-medium">Performing Well</p>
                      <p className="mt-1 opacity-90">
                        Actual defects are within or below expected levels. Continue monitoring.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KPIOverview;