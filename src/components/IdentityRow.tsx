import type { ReactNode } from "react";
import { Stack, Typography, Chip, Box } from "@mui/material";
import { TimestampRelative } from "./TimestampRelative";

export interface IdentityT {
  id: string;
  collaborator_email: string;
  collaborator_name?: string;
  external_id: string;
  external_metadata?: Record<string, unknown>;
  status: "active" | "soft_deleted";
  last_seen_at?: string;
}

export interface IdentityRowProps {
  identity: IdentityT;
  action?: ReactNode;
}

export function IdentityRow({ identity, action }: IdentityRowProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ py: 1, borderBottom: 1, borderColor: "divider" }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" component="div">
          {identity.collaborator_email}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          ext: {identity.external_id}
        </Typography>
      </Box>
      <Chip
        size="small"
        label={identity.status === "active" ? "Ativo" : "Desvinculado"}
        color={identity.status === "active" ? "success" : "default"}
        variant="outlined"
      />
      {identity.last_seen_at ? (
        <Typography variant="caption" color="text.secondary">
          <TimestampRelative isoString={identity.last_seen_at} />
        </Typography>
      ) : null}
      {action}
    </Stack>
  );
}
