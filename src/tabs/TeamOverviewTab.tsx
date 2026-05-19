import { Card, CardContent, Stack, Typography, Box, Chip } from "@mui/material";
import type { TeamTabProps } from "../shell/TeamContextShell";
import { useDriftStatus } from "../hooks/useDriftStatus";
import { useActionCatalog } from "../hooks/useActionCatalog";
import { useIdentities } from "../hooks/useIdentities";
import { useRecentRuns } from "../hooks/useRecentRuns";
import { LoadingState } from "../components/LoadingState";
import { DriftBadge } from "../components/DriftBadge";
import { TimestampRelative } from "../components/TimestampRelative";

// Team-centric health dashboard. Aggregates the four core signals
// (drift, identities, recent runs, action surface size) into a single
// glanceable grid so the operator gets "is my team OK?" in one screen.
//
// This is intentionally minimal — each card links into the full faceted
// tab for the same data. Future work: surface team-specific drift once
// drift rows carry team_id, repos-without-CODEOWNERS guardrail, etc.
export function TeamOverviewTab({ teamId, instanceId, integrationType }: TeamTabProps) {
  const drift = useDriftStatus(integrationType);
  const identities = useIdentities({ integrationType, instanceId });
  const runs = useRecentRuns(instanceId, 10);
  const catalog = useActionCatalog(integrationType);

  if (drift.isLoading && identities.isLoading && runs.isLoading && catalog.isLoading) {
    return <LoadingState />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        Time: <strong>{teamId.slice(0, 8)}…</strong> · Integração: <strong>{integrationType}</strong>
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 2
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Drift
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 1 }}>
              <DriftBadge inSync={!!drift.data?.in_sync} />
              <Typography variant="h3">{drift.data?.items.length ?? 0}</Typography>
            </Stack>
            {drift.data?.last_sync_at ? (
              <Typography variant="caption" color="text.secondary">
                Última detecção: <TimestampRelative isoString={drift.data.last_sync_at} />
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Sem detecções recentes.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Identidades vinculadas
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {identities.data?.total ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {identities.data?.items.length ?? 0} ativas
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Runs recentes
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {runs.data?.items.length ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              últimos 10 eventos
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Actions disponíveis
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {catalog.data?.items.length ?? 0}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: "wrap" }}>
              {(catalog.data?.items ?? []).slice(0, 3).map((a) => (
                <Chip key={a.name} size="small" label={a.name} variant="outlined" />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
