import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MessageSquare, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-4">
            Brototype Complaint Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A transparent and efficient system for students to lodge complaints and track resolutions,
            while empowering staff to manage and resolve issues seamlessly.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <Card className="border-primary/20">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Easy Submission</CardTitle>
              <CardDescription>
                Submit complaints quickly with categorization and detailed descriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Students can easily lodge complaints across various categories including academics,
                administration, facilities, and technical issues.
              </p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-secondary mb-4" />
              <CardTitle>Real-time Tracking</CardTitle>
              <CardDescription>
                Monitor complaint status and receive updates throughout the resolution process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your complaints from submission to resolution with status updates like
                Open, In Progress, and Resolved.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Users className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>
                Admin and staff can efficiently manage, respond, and resolve complaints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive dashboard for staff to view all complaints, filter by status,
                respond to students, and update complaint statuses.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Create an Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign up as a student or staff member to access the system
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Submit or Manage Complaints</h3>
                  <p className="text-sm text-muted-foreground">
                    Students submit complaints, staff manage and respond to them
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor status updates and receive responses until resolution
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
