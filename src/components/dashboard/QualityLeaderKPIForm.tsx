import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

      const { error } = await supabase.from("kpi_records").insert({
        department: userDepartment as any,
        total_production: total,
        expected_defects: 0, // Quality leaders don't set expected defects
        actual_defects: actual,
        defect_percentage: defectPercentage,
        variance: null, // No variance calculation without expected defects
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

      // Reset form
      setTotalProduction("");
      setActualDefects("");
      setReasonForDefects("");
      setCorrectiveAction("");
      setResponsibleOfficer("");
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
  const isPositiveGap = parseFloat(defectPercentage) > 0;

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
            <Label>KPI Gap Status</Label>
            <div className={`h-10 rounded-md border border-input px-3 py-2 text-sm flex items-center ${
              isPositiveGap ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"
            }`}>
              {isPositiveGap ? "⚠️ Negative Gap - Action Required" : "✓ Positive Gap - On Track"}
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
