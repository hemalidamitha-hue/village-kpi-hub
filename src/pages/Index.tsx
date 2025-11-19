import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, BarChart3, Users, Award, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Sustainable Village Collaboration</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              KPI Monitoring System
              <span className="block text-primary mt-2">for Excellence</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track, analyze, and improve departmental performance with our comprehensive
              KPI monitoring solution designed for the SVCM framework
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-lg px-8"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Comprehensive KPI Tracking
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to monitor and improve performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Real-time Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor KPIs with interactive charts and timeline filters
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg">Quality Circles</h3>
                <p className="text-sm text-muted-foreground">
                  Collaborate across departments for continuous improvement
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold text-lg">Recognition System</h3>
                <p className="text-sm text-muted-foreground">
                  Celebrate achievements and motivate teams
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg">Performance Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Color-coded indicators for quick performance assessment
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-xl">
            <CardContent className="py-12 space-y-6">
              <h2 className="text-3xl font-bold">Ready to Transform Your KPI Management?</h2>
              <p className="text-lg text-primary-foreground/90">
                Join the Sustainable Village Collaboration Model and start tracking performance today
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-card text-foreground hover:bg-card/90 text-lg px-8"
              >
                Start Monitoring Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
