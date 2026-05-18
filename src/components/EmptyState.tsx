import type { ReactNode } from "react";
import { Stack, Typography, Box } from "@mui/material";
import { spacing } from "../tokens/spacing";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{ p: `${spacing.xl}px`, textAlign: "center" }}
    >
      {icon ? <Box sx={{ color: "text.secondary" }}>{icon}</Box> : null}
      <Typography variant="h6">{title}</Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      ) : null}
      {action}
    </Stack>
  );
}
