export const brand = {
  slack: { primary: "#4A154B", onPrimary: "#FFFFFF" },
  github: { primary: "#24292F", onPrimary: "#FFFFFF" },
  grafana: { primary: "#F46800", onPrimary: "#FFFFFF" },
  "google-workspace": { primary: "#4285F4", onPrimary: "#FFFFFF" },
  kubernetes: { primary: "#326CE5", onPrimary: "#FFFFFF" },
  aws: { primary: "#FF9900", onPrimary: "#0F172A" },
  "secrets-management": { primary: "#5C6BC0", onPrimary: "#FFFFFF" },
  "webhooks-external": { primary: "#00ACC1", onPrimary: "#FFFFFF" }
} as const;

export type BrandKey = keyof typeof brand;
