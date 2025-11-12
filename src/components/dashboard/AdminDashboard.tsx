import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  profiles: { full_name: string; email: string };
  complaint_responses: { message: string; created_at: string }[];
}

interface AdminDashboardProps {
  userId: string;
  role: string;
}

const AdminDashboard = ({ userId, role }: AdminDashboardProps) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [newStatus, setNewStatus] = useState<"open" | "in_progress" | "resolved">("open");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          profiles!complaints_student_id_fkey(full_name, email),
          complaint_responses(message, created_at)
        `)
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

  const handleStatusUpdate = async (complaintId: string, status: "open" | "in_progress" | "resolved") => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status })
        .eq("id", complaintId);

      if (error) throw error;

      toast.success("Status updated successfully!");
      fetchComplaints();
    } catch (error: any) {
      toast.error("Error updating status");
      console.error(error);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const { error } = await supabase.from("complaint_responses").insert({
        complaint_id: selectedComplaint.id,
        responder_id: userId,
        message: responseMessage,
      });

      if (error) throw error;

      if (newStatus && newStatus !== selectedComplaint.status) {
        await handleStatusUpdate(selectedComplaint.id, newStatus);
      }

      toast.success("Response submitted successfully!");
      setSelectedComplaint(null);
      setResponseMessage("");
      setNewStatus("open");
      fetchComplaints();
    } catch (error: any) {
      toast.error("Error submitting response");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      open: { variant: "destructive", label: "Open" },
      in_progress: { variant: "secondary", label: "In Progress" },
      resolved: { variant: "default", label: "Resolved" },
    };

    const { variant, label } = config[status] || { variant: "outline", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const filterByStatus = (status: string) => {
    return complaints.filter(c => c.status === status);
  };

  const ComplaintCard = ({ complaint }: { complaint: Complaint }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{complaint.title}</CardTitle>
            <CardDescription className="mt-1">
              {complaint.profiles.full_name} ({complaint.profiles.email})
            </CardDescription>
            <CardDescription>
              {complaint.category} • {new Date(complaint.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          {getStatusBadge(complaint.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground mb-4">{complaint.description}</p>
        
        {complaint.complaint_responses && complaint.complaint_responses.length > 0 && (
          <div className="mb-4 space-y-2 border-t pt-4">
            <h4 className="font-semibold text-sm text-foreground">Previous Responses:</h4>
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

        <div className="flex gap-2">
          <Select
            value={complaint.status}
            onValueChange={(value: "open" | "in_progress" | "resolved") => handleStatusUpdate(complaint.id, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedComplaint(complaint);
                  setNewStatus(complaint.status as "open" | "in_progress" | "resolved");
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Respond
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Respond to Complaint</DialogTitle>
                <DialogDescription>
                  {complaint.title}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="response">Your Response</Label>
                  <Textarea
                    id="response"
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Provide your response or update to the student"
                    required
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Update Status</Label>
                  <Select value={newStatus} onValueChange={(value: "open" | "in_progress" | "resolved") => setNewStatus(value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Submit Response</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading complaints...</div>;
  }

  const openCount = filterByStatus("open").length;
  const inProgressCount = filterByStatus("in_progress").length;
  const resolvedCount = filterByStatus("resolved").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Complaint Management</h2>
        <p className="text-muted-foreground">Manage and respond to student complaints</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({complaints.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({openCount})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressCount})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {complaints.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No complaints to display</p>
              </CardContent>
            </Card>
          ) : (
            complaints.map(complaint => <ComplaintCard key={complaint.id} complaint={complaint} />)
          )}
        </TabsContent>

        <TabsContent value="open" className="space-y-4 mt-6">
          {filterByStatus("open").map(complaint => <ComplaintCard key={complaint.id} complaint={complaint} />)}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4 mt-6">
          {filterByStatus("in_progress").map(complaint => <ComplaintCard key={complaint.id} complaint={complaint} />)}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-6">
          {filterByStatus("resolved").map(complaint => <ComplaintCard key={complaint.id} complaint={complaint} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
