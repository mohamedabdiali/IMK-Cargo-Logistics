import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminData } from "@/context/AdminDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, UserPlus, Trash2 } from "lucide-react";

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
};

export default function AdminCustomers() {
  const { customers, cargoJobs, customsEntries, addCustomer, removeCustomer } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    password: "",
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const target = `${customer.name} ${customer.email}`;
      return target.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [customers, searchTerm]);

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addCustomer(newClient.name, newClient.email, newClient.password);
    if (!result.success) {
      toast({
        title: "Could not create customer login",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    setNewClient({
      name: "",
      email: "",
      password: "",
    });
    toast({
      title: "Customer account created",
      description: result.message,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Accounts</h1>
          <p className="text-muted-foreground">
            Manage customer logins and monitor active orders and customs activity.
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Create Customer Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Customer Name"
                value={newClient.name}
                onChange={(e) => setNewClient((current) => ({ ...current, name: e.target.value }))}
              />
              <Input
                placeholder="Customer Email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient((current) => ({ ...current, email: e.target.value }))}
              />
              <Input
                placeholder="Password"
                type="text"
                value={newClient.password}
                onChange={(e) => setNewClient((current) => ({ ...current, password: e.target.value }))}
              />
              <Button type="submit">
                <UserPlus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredCustomers.map((customer) => {
            const jobs = cargoJobs.filter(
              (job) => job.clientEmail.toLowerCase() === customer.email.toLowerCase()
            );
            const holds = customsEntries.filter(
              (entry) =>
                entry.status === "On Hold" &&
                jobs.some((job) => job.trackingNumber === entry.trackingNumber)
            ).length;

            return (
              <Card key={customer.email} className="border-border/60">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {formatDate(customer.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {jobs.length} active order{jobs.length === 1 ? "" : "s"}
                      </Badge>
                      <Badge variant="outline" className={holds > 0 ? "text-yellow-700 border-yellow-200 bg-yellow-50" : ""}>
                        {holds} customs hold{holds === 1 ? "" : "s"}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          removeCustomer(customer.email);
                          toast({
                            title: "Customer removed",
                            description: `${customer.email} has been removed.`,
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
