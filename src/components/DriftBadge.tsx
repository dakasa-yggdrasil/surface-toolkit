import { Chip } from "@mui/material";

export interface DriftBadgeProps {
  inSync: boolean;
}

export function DriftBadge({ inSync }: DriftBadgeProps) {
  if (inSync) {
    return <Chip size="small" label="Sincronizado" color="success" />;
  }
  return <Chip size="small" label="Drift detectado" color="warning" />;
}
