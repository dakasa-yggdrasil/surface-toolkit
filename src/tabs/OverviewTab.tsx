import { Stack, Typography, Paper } from "@mui/material";
import { useInstance } from "../hooks/useInstance";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { JsonViewer } from "../components/JsonViewer";
import { TimestampRelative } from "../components/TimestampRelative";

export interface OverviewTabProps {
  instanceId: string;
  integrationType: string;
}

function sanitizeConfig(config: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!config) return {};
  const SENSITIVE = new Set(["token", "secret", "password", "api_key", "private_key"]);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(config)) {
    out[k] = SENSITIVE.has(k.toLowerCase()) ? "•••" : v;
  }
  return out;
}

export function OverviewTab({ instanceId }: OverviewTabProps) {
  const { data, isLoading, error } = useInstance(instanceId);
  if (isLoading) return <LoadingState />;
  if (error || !data) return <EmptyState title="Sem dados" description="Não foi possível carregar a instância." />;
  return (
    <Stack spacing={2}>
      <Typography variant="h6">{data.name ?? data.id}</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Atualizado
          </Typography>
          <Typography variant="body2">
            {data.updated_at ? <TimestampRelative isoString={data.updated_at} /> : "—"}
          </Typography>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          Configuração
        </Typography>
        <JsonViewer value={sanitizeConfig(data.config)} />
      </Paper>
    </Stack>
  );
}
