import { CircularProgress, Stack, Typography } from "@mui/material";
import { spacing } from "../tokens/spacing";

export interface LoadingStateProps {
  label?: string;
  size?: number;
}

export function LoadingState({ label = "Carregando…", size = 32 }: LoadingStateProps) {
  return (
    <Stack
      role="status"
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{ p: `${spacing.lg}px` }}
    >
      <CircularProgress size={size} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}
