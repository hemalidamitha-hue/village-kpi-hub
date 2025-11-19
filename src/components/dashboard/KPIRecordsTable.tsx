import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface KPIRecord {
  id: string;
  entry_date: string;
  department: string;
  total_production: number;
  actual_defects: number;
  defect_percentage: number | null;
  variance: number | null;
  reason_for_defects: string | null;
  corrective_action: string | null;
  responsible_officer: string | null;
  status: string | null;
}

interface KPIRecordsTableProps {
  department?: string | null;
  userRole?: string | null;
}

export const KPIRecordsTable = ({ department, userRole }: KPIRecordsTableProps) => {
  const [records, setRecords] = useState<KPIRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, [department]);

  const fetchRecords = async () => {
    try {
      let query = supabase
        .from("kpi_records")
        .select("*")
        .order("entry_date", { ascending: false })
        .limit(10);

      if (department && userRole !== "admin") {
        query = query.eq("department", department as any);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRecords((data as KPIRecord[]) || []);
    } catch (error) {
      console.error("Error fetching KPI records:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (dept: string) => {
    return dept
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent KPI Records</CardTitle>
          <CardDescription>Latest submissions with reasons and corrective actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent KPI Records</CardTitle>
          <CardDescription>Latest submissions with reasons and corrective actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No KPI records found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent KPI Records</CardTitle>
        <CardDescription>Latest submissions with reasons and corrective actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {userRole === "admin" && <TableHead>Department</TableHead>}
                <TableHead>Production</TableHead>
                <TableHead>Defects</TableHead>
                <TableHead>Defect %</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Responsible Officer</TableHead>
                <TableHead>Reason for Defects</TableHead>
                <TableHead>Corrective Actions</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{formatDate(record.entry_date)}</TableCell>
                  {userRole === "admin" && (
                    <TableCell>{getDepartmentName(record.department)}</TableCell>
                  )}
                  <TableCell>{record.total_production.toLocaleString()}</TableCell>
                  <TableCell>{record.actual_defects.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={record.defect_percentage && record.defect_percentage > 5 ? "text-destructive" : "text-green-600"}>
                      {record.defect_percentage?.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={record.variance && record.variance > 0 ? "text-destructive" : "text-green-600"}>
                      {record.variance && record.variance > 0 ? '+' : ''}{record.variance?.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell>{record.responsible_officer || "—"}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate" title={record.reason_for_defects || ""}>
                      {record.reason_for_defects || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate" title={record.corrective_action || ""}>
                      {record.corrective_action || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.status === "completed" ? "default" : "secondary"}>
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
