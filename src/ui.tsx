import React from "react";
import { ExternalLink } from "lucide-react";

export function Link({
  to,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  return (
    <a href={"#" + to} {...props}>
      {children}
    </a>
  );
}

export function SourceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="source-link"
    >
      {children}
      <ExternalLink size={14} />
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}

export function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={"badge " + tone}>{children}</span>;
}

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

/** A short "not saved" / "saved" line for write feedback. */
export function SaveStatus({
  state,
  message,
}: {
  state: "idle" | "saving" | "saved" | "error";
  message?: string;
}) {
  if (state === "idle") return null;
  return (
    <span
      className={"save-status " + state}
      role={state === "error" ? "alert" : "status"}
    >
      {state === "saving" && "Saving…"}
      {state === "saved" && "Saved on this device"}
      {state === "error" && (message || "Not saved")}
    </span>
  );
}
