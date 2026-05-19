import { Stack, Typography, Paper } from "@mui/material";
import { useDriftStatus, type DriftItemT } from "../hooks/useDriftStatus";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { DriftBadge } from "../components/DriftBadge";
import { DataTable } from "../components/DataTable";
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
            Última detecção: <TimestampRelative isoString={data.last_sync_at} />
          </Typography>
        ) : null}
        <Typography variant="caption" color="text.secondary">
          {data.items.length} item(s)
        </Typography>
      </Stack>
      {data.in_sync ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Nenhuma divergência detectada nessa integração.
          </Typography>
        </Paper>
      ) : (
        <DataTable<DriftItemT>
          rows={data.items}
          keyField="id"
          columns={[
            { id: "kind", header: "Resource", accessor: (r) => r.resource_kind, sortable: true },
            { id: "name", header: "Name", accessor: (r) => r.name, sortable: true },
            { id: "severity", header: "Severity", accessor: (r) => r.severity, sortable: true },
            {
              id: "last",
              header: "Detected",
              accessor: (r) =>
                r.last_reconcile_at ? <TimestampRelative isoString={r.last_reconcile_at} /> : "—"
            }
          ]}
        />
      )}
    </Stack>
  );
}
