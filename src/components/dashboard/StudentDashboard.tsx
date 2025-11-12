import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, MessageSquare } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  complaint_responses: { message: string; created_at: string }[];
}

interface StudentDashboardProps {
  userId: string;
}

const StudentDashboard = ({ userId }: StudentDashboardProps) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, [userId]);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          complaint_responses(message, created_at)
        `)
        .eq("student_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error: any) {
      toast.error("Error loading complaints");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("complaints").insert({
        student_id: userId,
        title,
        description,
        category: category as "academics" | "administration" | "facilities" | "technical" | "other",
      });

      if (error) throw error;

      toast.success("Complaint submitted successfully!");
      setDialogOpen(false);
      setTitle("");
      setDescription("");
      setCategory("");
      fetchComplaints();
    } catch (error: any) {
      toast.error("Error submitting complaint");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "destructive",
      in_progress: "secondary",
      resolved: "default",
    };
    
    const labels: Record<string, string> = {
      open: "Open",
      in_progress: "In Progress",
      resolved: "Resolved",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading complaints...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">My Complaints</h2>
          <p className="text-muted-foreground">View and track your submitted complaints</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit a Complaint</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll address it as soon as possible.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your complaint"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academics">Academics</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                    <SelectItem value="facilities">Facilities</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about your complaint"
                  required
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full">Submit Complaint</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {complaints.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No complaints yet</p>
            </CardContent>
          </Card>
        ) : (
          complaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{complaint.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {complaint.category} • {new Date(complaint.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(complaint.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4">{complaint.description}</p>
                
                {complaint.complaint_responses && complaint.complaint_responses.length > 0 && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <h4 className="font-semibold text-sm text-foreground">Responses:</h4>
                    {complaint.complaint_responses.map((response, idx) => (
                      <div key={idx} className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-foreground">{response.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(response.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
