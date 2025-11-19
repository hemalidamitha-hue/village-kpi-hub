import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Award,
  LogOut,
  BarChart3,
  FileText,
  Plus
} from "lucide-react";
import KPIOverview from "@/components/dashboard/KPIOverview";
import { AdminKPIForm } from "@/components/dashboard/AdminKPIForm";
import { QualityLeaderKPIForm } from "@/components/dashboard/QualityLeaderKPIForm";
import VarianceChart from "@/components/dashboard/VarianceChart";
import { KPIRecordsTable } from "@/components/dashboard/KPIRecordsTable";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Constants } from "@/integrations/supabase/types";

interface Profile {
  id: string;
  full_name: string;
  role: string;
  department: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [departmentSelection, setDepartmentSelection] = useState<string>("");
  const [savingDepartment, setSavingDepartment] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, department")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data as Profile);

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .single();

      if (!roleError && roleData) {
        setUserRole(roleData.role as string);
      }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getDepartmentName = (dept: string | null) => {
    if (!dept) return "No Department";
    return dept
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getRoleName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSaveDepartment = async () => {
    if (!departmentSelection) {
      toast({
        title: "Select department",
        description: "Please select your department before continuing.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingDepartment(true);
      const { error } = await supabase
        .from("profiles")
        .update({ department: departmentSelection as any })
        .eq("id", user?.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, department: departmentSelection } : prev));

      toast({
        title: "Department saved",
        description: "Your department has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingDepartment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const effectiveRole = userRole || profile?.role || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">SVCM Dashboard</h1>
              <p className="text-sm text-muted-foreground">Sustainable Village Collaboration Model</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{getRoleName(effectiveRole)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-lg">
            <CardContent className="pt-6">
              <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}!</h2>
              <p className="text-primary-foreground/90">
                {getDepartmentName(profile?.department)} • {getRoleName(effectiveRole)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Department Setup */}
        {!profile?.department && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Set Your Department</CardTitle>
                <CardDescription>
                  Select your department to enable KPI entry and department-specific analytics.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-1/2">
                  <Select
                    value={departmentSelection}
                    onValueChange={setDepartmentSelection}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {Constants.public.Enums.department_type.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {getDepartmentName(dept)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSaveDepartment}
                  disabled={savingDepartment || !departmentSelection}
                >
                  {savingDepartment ? "Saving..." : "Save Department"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* KPI Overview Charts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-foreground">KPI Performance Overview</h3>
            {effectiveRole === "admin" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all KPI records from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={async () => {
                      try {
                        const { error } = await supabase.from("kpi_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                        if (error) throw error;
                        toast({
                          title: "Success",
                          description: "All KPI records have been deleted.",
                        });
                        window.location.reload();
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message,
                          variant: "destructive",
                        });
                      }
                    }}>
                      Delete All Records
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <KPIOverview department={profile?.department} />
        </div>

        {/* Variance Chart */}
        <div className="mb-8">
          <VarianceChart department={profile?.department} />
        </div>

        {/* KPI Records Table */}
        <div className="mb-8">
          <KPIRecordsTable department={profile?.department} userRole={effectiveRole} />
        </div>

        {/* KPI Entry Form - Role Based */}
        {effectiveRole && profile?.department && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">KPI Entry</h3>
            {effectiveRole === "admin" ? (
              <AdminKPIForm userId={user?.id || ""} userDepartment={profile.department} />
            ) : effectiveRole === "quality_circle_leader" ? (
              <QualityLeaderKPIForm userId={user?.id || ""} userDepartment={profile.department} />
            ) : null}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">KPI Records</CardTitle>
              <BarChart3 className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">Total entries this month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">--%</div>
              <p className="text-xs text-muted-foreground">Average defect rate</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Meetings</CardTitle>
              <Users className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">Quality circle meetings</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recognition</CardTitle>
              <Award className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">Awards received</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/kpi/entry")}
              >
                <Plus className="w-4 h-4" />
                Enter KPI Data
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/analytics")}
              >
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/quality-circle")}
              >
                <Users className="w-4 h-4" />
                Quality Circle
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/recognition")}
              >
                <Award className="w-4 h-4" />
                Recognition & Rewards
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reports & Documentation
              </CardTitle>
              <CardDescription>Access reports and meeting notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="w-4 h-4" />
                Monthly KPI Report
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="w-4 h-4" />
                Quality Circle Minutes
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
