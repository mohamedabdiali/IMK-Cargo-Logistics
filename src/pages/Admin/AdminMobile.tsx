import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminData } from "@/context/AdminDataContext";
import { useLogisticsControl } from "@/context/LogisticsControlContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Smartphone, Upload } from "lucide-react";

export default function AdminMobile() {
  const { shipments } = useAdminData();
  const {
    driverTasks,
    createDriverTask,
    updateDriverTaskStatus,
    attachPodToTask,
  } = useLogisticsControl();

  const [taskDraft, setTaskDraft] = useState({
    trackingNumber: "",
    driver: "",
    type: "Pickup" as "Pickup" | "Delivery" | "POD Upload",
    dueAt: "",
  });
  const [podDraft, setPodDraft] = useState({
    taskId: "",
    fileName: "",
    uploadedBy: "",
  });

  const recentTasks = useMemo(() => driverTasks.slice(0, 12), [driverTasks]);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mobile Ops</h1>
          <p className="text-muted-foreground">
            Driver task orchestration for pickup/delivery scans and proof-of-delivery uploads.
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Create Driver Task</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Select
              value={taskDraft.trackingNumber || undefined}
              onValueChange={(value) => setTaskDraft((current) => ({ ...current, trackingNumber: value }))}
            >
              <SelectTrigger><SelectValue placeholder="Tracking Number" /></SelectTrigger>
              <SelectContent>
                {shipments.map((shipment) => (
                  <SelectItem key={shipment.trackingNumber} value={shipment.trackingNumber}>
                    {shipment.trackingNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Driver Name" value={taskDraft.driver} onChange={(e) => setTaskDraft((c) => ({ ...c, driver: e.target.value }))} />
            <Select
              value={taskDraft.type}
              onValueChange={(value) => setTaskDraft((current) => ({ ...current, type: value as "Pickup" | "Delivery" | "POD Upload" }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pickup">Pickup</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
                <SelectItem value="POD Upload">POD Upload</SelectItem>
              </SelectContent>
            </Select>
            <Input type="datetime-local" value={taskDraft.dueAt} onChange={(e) => setTaskDraft((c) => ({ ...c, dueAt: e.target.value }))} />
            <Button
              onClick={() => {
                const result = createDriverTask(taskDraft);
                if (!result.success) {
                  toast({ title: "Could not create task", description: result.message, variant: "destructive" });
                  return;
                }
                toast({ title: "Task created", description: result.message });
                setTaskDraft({ trackingNumber: "", driver: "", type: "Pickup", dueAt: "" });
              }}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Create
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Upload POD from Driver App</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={podDraft.taskId || undefined} onValueChange={(value) => setPodDraft((c) => ({ ...c, taskId: value }))}>
              <SelectTrigger><SelectValue placeholder="Driver Task" /></SelectTrigger>
              <SelectContent>
                {driverTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>{task.id} - {task.trackingNumber}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="POD filename (e.g. POD-123.jpg)" value={podDraft.fileName} onChange={(e) => setPodDraft((c) => ({ ...c, fileName: e.target.value }))} />
            <Input placeholder="Uploaded by" value={podDraft.uploadedBy} onChange={(e) => setPodDraft((c) => ({ ...c, uploadedBy: e.target.value }))} />
            <Button
              onClick={() => {
                const result = attachPodToTask(podDraft.taskId, podDraft.fileName, podDraft.uploadedBy || "Driver App");
                if (!result.success) {
                  toast({ title: "POD upload failed", description: result.message, variant: "destructive" });
                  return;
                }
                toast({ title: "POD uploaded", description: result.message });
                setPodDraft({ taskId: "", fileName: "", uploadedBy: "" });
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload POD
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Driver Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTasks.map((task) => (
              <div key={task.id} className="rounded-md border border-border/60 p-3">
                <p className="text-sm font-semibold">{task.id} - {task.trackingNumber}</p>
                <p className="text-xs text-muted-foreground">{task.driver} | {task.type} | Due {task.dueAt}</p>
                <p className="text-xs text-muted-foreground">Status: {task.status}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => updateDriverTaskStatus(task.id, "In Progress")}>In Progress</Button>
                  <Button size="sm" variant="outline" onClick={() => updateDriverTaskStatus(task.id, "Completed")}>Completed</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
