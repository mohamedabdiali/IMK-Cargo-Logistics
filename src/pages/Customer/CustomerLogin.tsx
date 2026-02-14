import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Lock, Mail, UserRound } from "lucide-react";
import { WhatsAppHeroCTA } from "@/components/common/WhatsAppHeroCTA";

type AuthMode = "login" | "register";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { login, registerCustomer } = useAuth();
  const [mode, setMode] = useState<AuthMode>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (mode === "login") {
        const success = login(email, password);
        setIsLoading(false);

        if (success) {
          toast({
            title: "Signed in",
            description: "Welcome to your customer portal.",
          });
          navigate("/customer/portal");
          return;
        }

        toast({
          title: "Login failed",
          description: "Invalid customer email or password.",
          variant: "destructive",
        });
        return;
      }

      if (password !== confirmPassword) {
        setIsLoading(false);
        toast({
          title: "Password mismatch",
          description: "Password and confirm password must match.",
          variant: "destructive",
        });
        return;
      }

      const result = registerCustomer(name, email, password);
      setIsLoading(false);

      if (result.success) {
        toast({
          title: "Account created",
          description: "Customer profile created and signed in.",
        });
        navigate("/customer/portal");
        return;
      }

      toast({
        title: "Account creation failed",
        description: result.message,
        variant: "destructive",
      });
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <WhatsAppHeroCTA contextLabel="Customer login page" theme="light" />
        <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold text-center">
            {mode === "login" ? "Customer Portal Login" : "Create Customer Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "login"
              ? "Sign in to access tracking, documents, billing, and notifications."
              : "Create a customer account to manage shipments end-to-end."}
          </CardDescription>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={mode === "register" ? "default" : "outline"}
              onClick={() => setMode("register")}
            >
              Create Account
            </Button>
            <Button
              type="button"
              variant={mode === "login" ? "default" : "outline"}
              onClick={() => setMode("login")}
            >
              Sign In
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ayaan Ali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Demo customers:</strong>
              <br />
              Email: customer@imkcargo.com
              <br />
              Password: customer123
              <br />
              <br />
              Email: new.customer@example.com
              <br />
              Password: newcustomer123
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
