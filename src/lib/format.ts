import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), "dd MMM yyyy, hh:mm a");
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
