import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  kicker,
  title,
  subtitle,
  align = "left",
  className,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker ? <div className="hero-kicker mb-4">{kicker}</div> : null}
      <h2 className="section-title">{title}</h2>
      {subtitle ? <p className="section-subtitle mt-4">{subtitle}</p> : null}
    </div>
  );
}

export function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn("card-glow", hover && "transition-transform duration-300 hover:-translate-y-1", className)}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="stat-pill">
      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-white">{value}</div>
      {helper ? <div className="mt-1 text-sm text-slate-300">{helper}</div> : null}
    </div>
  );
}

export function InfoPill({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="badge-soft">
      {icon}
      {label}
    </span>
  );
}

export function CTAGroup({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">{primary}{secondary}</div>
  );
}
