import { Link } from "@tanstack/react-router";
import logo from "@/assets/snapcut-logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <img src={logo} alt="SnapCut AI logo" width={36} height={36} className="h-9 w-9" />
      <span className="font-display text-lg font-semibold tracking-tight">
        SnapCut<span className="text-gradient"> AI</span>
      </span>
    </Link>
  );
}
