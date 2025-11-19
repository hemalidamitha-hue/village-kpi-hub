import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QualityLeaderKPIFormProps {
  userId: string;
  userDepartment: string;
}

export const QualityLeaderKPIForm = ({ userId, userDepartment }: QualityLeaderKPIFormProps) => {
  const [totalProduction, setTotalProduction] = useState("");
  const [actualDefects, setActualDefects] = useState("");
  const [reasonForDefects, setReasonForDefects] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [responsibleOfficer, setResponsibleOfficer] = useState("");
  const [expectedPercentage, setExpectedPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchExpectedPercentage();
  }, [userDepartment]);

  const fetchExpectedPercentage = async () => {
    try {
      const { data, error } = await supabase
        .from("kpi_records")
        .select("expected_defects, total_production")
        .eq("department", userDepartment as any);

      if (error) throw error;

      if (data && data.length > 0) {
        // Calculate average expected percentage from department records
        const totalExpectedPercentage = data.reduce((sum, record) => sum + Number(record.expected_defects), 0);
        const avgExpected = totalExpectedPercentage / data.length;
        setExpectedPercentage(avgExpected);
      }
    } catch (error) {
      console.error("Error fetching expected percentage:", error);
    }
  };

  const calculateDefectPercentage = (actual: number, total: number): number => {
    if (total === 0) return 0;
    return parseFloat(((actual / total) * 100).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const total = parseInt(totalProduction);
      const actual = parseInt(actualDefects);

      if (total <= 0) {
        throw new Error("Total production must be greater than 0");
      }

      const defectPercentage = calculateDefectPercentage(actual, total);

      // Insert without defect_percentage - the trigger will calculate it
      const { error } = await supabase.from("kpi_records").insert({
        department: userDepartment as any,
        total_production: total,
        expected_defects: expectedPercentage, // Use department's expected percentage
        actual_defects: actual,
        reason_for_defects: reasonForDefects,
        corrective_action: correctiveAction,
        responsible_officer: responsibleOfficer,
        created_by: userId,
        entry_date: new Date().toISOString().split('T')[0],
        status: "pending" as any,
      });

      if (error) throw error;

      toast({
        title: "KPI Record Submitted",
        description: "Your KPI record has been submitted successfully.",
      });

      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const total = parseInt(totalProduction) || 0;
  const actual = parseInt(actualDefects) || 0;
  const defectPercentage = total > 0 ? calculateDefectPercentage(actual, total).toFixed(2) : "0.00";
  const gapValue = parseFloat(defectPercentage) - expectedPercentage;
  const isPositiveGap = gapValue > 0; // Positive gap means actual > expected (bad)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Circle Team Leader KPI Entry</CardTitle>
        <CardDescription>Submit KPI records with actual defect tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totalProduction">Total Production (Quantity)</Label>
            <Input
              id="totalProduction"
              type="number"
              value={totalProduction}
              onChange={(e) => setTotalProduction(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualDefects">Actual Defects (Quantity)</Label>
            <Input
              id="actualDefects"
              type="number"
              value={actualDefects}
              onChange={(e) => setActualDefects(e.target.value)}
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Defect Percentage</Label>
            <div className="h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm">
              {defectPercentage}%
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expected Defects Percentage</Label>
            <div className="h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm">
              {expectedPercentage.toFixed(2)}%
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gap (Variance)</Label>
            <div className={`h-10 rounded-md border border-input px-3 py-2 text-sm ${
              isPositiveGap ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"
            }`}>
              {gapValue > 0 ? '+' : ''}{gapValue.toFixed(2)}% {isPositiveGap ? "(Above Expected)" : "(Below Expected)"}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibleOfficer">Responsible Officer</Label>
            <Input
              id="responsibleOfficer"
              type="text"
              value={responsibleOfficer}
              onChange={(e) => setResponsibleOfficer(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasonForDefects">Reason for Defects</Label>
            <Textarea
              id="reasonForDefects"
              value={reasonForDefects}
              onChange={(e) => setReasonForDefects(e.target.value)}
              placeholder="Explain why defects occurred..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctiveAction">Corrective Actions</Label>
            <Textarea
              id="correctiveAction"
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Describe the corrective actions taken..."
              rows={3}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit KPI Record"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
