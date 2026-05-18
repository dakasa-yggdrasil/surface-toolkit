import { Chip } from "@mui/material";

export type HealthStatus = "healthy" | "degraded" | "down" | "unknown";

export interface HealthBadgeProps {
  status: HealthStatus;
}

const map: Record<HealthStatus, { label: string; color: "success" | "warning" | "error" | "default" }> = {
  healthy: { label: "Saudável", color: "success" },
  degraded: { label: "Degradado", color: "warning" },
  down: { label: "Fora do ar", color: "error" },
  unknown: { label: "Desconhecido", color: "default" }
};

export function HealthBadge({ status }: HealthBadgeProps) {
  const { label, color } = map[status];
  return <Chip size="small" label={label} color={color} variant="outlined" />;
}
