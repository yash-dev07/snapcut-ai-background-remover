import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — SnapCut AI" },
      {
        name: "description",
        content:
          "Create a free SnapCut AI account and remove 5 image backgrounds per day, no credit card required.",
      },
      { property: "og:title", content: "Create your account — SnapCut AI" },
      {
        property: "og:description",
        content: "Free plan with 5 AI background removals per day. No credit card required.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <AuthShell
      title="Start free"
      subtitle="5 background removals every day, no card required."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" placeholder="Ada Lovelace" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" />
        </div>
        <Button type="submit" variant="hero" className="w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
