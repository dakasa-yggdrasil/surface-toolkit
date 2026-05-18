import { Stack, Typography, Paper, Alert, AlertTitle } from "@mui/material";
import { useDriftStatus } from "../hooks/useDriftStatus";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { DriftBadge } from "../components/DriftBadge";
import { TimestampRelative } from "../components/TimestampRelative";

export interface DriftTabProps {
  instanceId: string;
  integrationType: string;
}

export function DriftTab({ integrationType }: DriftTabProps) {
  const { data, isLoading, error } = useDriftStatus(integrationType);
  if (isLoading) return <LoadingState />;
  if (error || !data) return <EmptyState title="Sem dados de drift" />;
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <DriftBadge inSync={data.in_sync} />
        {data.last_sync_at ? (
          <Typography variant="caption" color="text.secondary">
            Último sync: <TimestampRelative isoString={data.last_sync_at} />
          </Typography>
        ) : null}
      </Stack>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2">
          Versão declarada: <strong>{data.declared_version ?? "—"}</strong>
        </Typography>
        <Typography variant="body2">
          Versão em runtime: <strong>{data.running_version ?? "—"}</strong>
        </Typography>
      </Paper>
      {data.failures && data.failures.length > 0 ? (
        <Alert severity="warning">
          <AlertTitle>Falhas de validação</AlertTitle>
          <ul>
            {data.failures.map((f, idx) => (
              <li key={idx}>
                <strong>{f.field}:</strong> {f.reason}
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}
    </Stack>
  );
}
