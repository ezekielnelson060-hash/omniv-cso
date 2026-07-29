import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(value: number): string {
  return Math.round(value).toString();
}

export function scoreColor(value: number): string {
  if (value >= 80) return "text-omniv-success";
  if (value >= 60) return "text-omniv-gold";
  if (value >= 40) return "text-omniv-warning";
  return "text-omniv-danger";
}

export function scoreBg(value: number): string {
  if (value >= 80) return "bg-omniv-success/10 border-omniv-success/20";
  if (value >= 60) return "bg-omniv-gold/10 border-omniv-gold/20";
  if (value >= 40) return "bg-omniv-warning/10 border-omniv-warning/20";
  return "bg-omniv-danger/10 border-omniv-danger/20";
}
