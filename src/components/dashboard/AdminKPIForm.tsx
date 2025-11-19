import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminKPIFormProps {
  userId: string;
  userDepartment: string;
}

export const AdminKPIForm = ({ userId, userDepartment }: AdminKPIFormProps) => {
  const [totalProduction, setTotalProduction] = useState("");
  const [expectedDefects, setExpectedDefects] = useState("");
  const [actualDefects, setActualDefects] = useState("");
  const [reasonForDefects, setReasonForDefects] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [responsibleOfficer, setResponsibleOfficer] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateDefectPercentage = (actual: number, total: number): number => {
    if (total === 0) return 0;
    return parseFloat(((actual / total) * 100).toFixed(2));
  };

  const calculateVariance = (expected: number, actual: number, total: number): number => {
    if (total === 0) return 0;
    const actualPercentage = (actual / total) * 100;
    return parseFloat((actualPercentage - expected).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const total = parseInt(totalProduction);
      const expected = parseInt(expectedDefects);
      const actual = parseInt(actualDefects);

      if (total <= 0) {
        throw new Error("Total production must be greater than 0");
      }

      const defectPercentage = calculateDefectPercentage(actual, total);
      const variance = calculateVariance(expected, actual, total);

      // Insert without defect_percentage and variance - the trigger will calculate them
      const { error } = await supabase.from("kpi_records").insert({
        department: userDepartment as any,
        total_production: total,
        expected_defects: expected,
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
  const expected = parseInt(expectedDefects) || 0;
  const actual = parseInt(actualDefects) || 0;
  const defectPercentage = total > 0 ? calculateDefectPercentage(actual, total).toFixed(2) : "0.00";
  const variance = total > 0 ? calculateVariance(expected, actual, total).toFixed(2) : "0.00";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin KPI Entry</CardTitle>
        <CardDescription>Submit KPI records with expected and actual defect percentages</CardDescription>
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
            <Label htmlFor="expectedDefects">Expected Percentage</Label>
            <Input
              id="expectedDefects"
              type="number"
              value={expectedDefects}
              onChange={(e) => setExpectedDefects(e.target.value)}
              required
              min="0"
              step="0.01"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Actual Defects Percentage</Label>
              <div className="h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm">
                {defectPercentage}%
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gap (Variance)</Label>
              <div className={`h-10 rounded-md border border-input px-3 py-2 text-sm ${
                parseFloat(variance) > 0 ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"
              }`}>
                {variance}% {parseFloat(variance) > 0 ? "(Above Expected)" : "(Below Expected)"}
              </div>
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
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctiveAction">Corrective Actions</Label>
            <Textarea
              id="correctiveAction"
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              rows={3}
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
