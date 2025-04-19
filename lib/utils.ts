import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

export function truncateText(text: string, length: number) {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Logs errors to a service (e.g., Sentry, LogRocket, or custom backend)
 * This implementation is a placeholder - in production, you would
 * integrate with an actual error tracking service
 */
export function logErrorToService(error: Error, errorInfo?: React.ErrorInfo): void {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.group('Error logged to service');
    console.error(error);
    if (errorInfo) {
      console.error('Component Stack:', errorInfo.componentStack);
    }
    console.groupEnd();
    return;
  }

  // In production, this would send to an error tracking service
  // For example, with Sentry:
  // Sentry.captureException(error, { extra: errorInfo });
  
  // For now, we'll just log to console in a safer way that doesn't expose
  // sensitive details to users
  console.error('An error occurred. The development team has been notified.');
  
  // You could also send to your own API endpoint:
  // fetch('/api/log-error', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     message: error.message,
  //     stack: error.stack,
  //     componentStack: errorInfo?.componentStack,
  //     timestamp: new Date().toISOString(),
  //   }),
  // }).catch(e => console.error('Failed to log error to API:', e));
}
