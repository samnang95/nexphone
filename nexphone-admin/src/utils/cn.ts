/**
 * Utility function to conditionally join Tailwind class names cleanly.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
