import type { NavSection } from "@/types/navigation";

export const DASHBOARD_NAV_SECTIONS: readonly NavSection[] = [
  {
    title: "Core",
    items: [
      { title: "Overview", href: "/" },
      { title: "Connected Devices", href: "/devices", badge: "Live" },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Telemetry & Logs", href: "#" },
      { title: "Firmware OTA", href: "#" },
    ],
  },
] as const;