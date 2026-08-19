import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SnapCut AI" },
      {
        name: "description",
        content: "Sign in to your SnapCut AI account to remove backgrounds and manage your credits.",
      },
      { property: "og:title", content: "Sign in — SnapCut AI" },
      { property: "og:description", content: "Access your SnapCut AI workspace and credits." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue cutting backgrounds."
      footer={
        <>
          New to SnapCut AI?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" />
        </div>
        <Button type="submit" variant="hero" className="w-full">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
