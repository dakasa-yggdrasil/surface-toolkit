import { useRecentRuns, type RunT } from "../hooks/useRecentRuns";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { DataTable } from "../components/DataTable";
import { TimestampRelative } from "../components/TimestampRelative";

export interface RecentRunsTabProps {
  instanceId: string;
  integrationType: string;
}

export function RecentRunsTab({ instanceId }: RecentRunsTabProps) {
  const { data, isLoading } = useRecentRuns(instanceId);
  if (isLoading) return <LoadingState />;
  if (!data || data.items.length === 0) {
    return <EmptyState title="Nenhuma execução recente" />;
  }
  return (
    <DataTable<RunT>
      rows={data.items}
      keyField="id"
      columns={[
        { id: "workflow", header: "Workflow", accessor: (r) => r.workflow_name, sortable: true },
        { id: "status", header: "Status", accessor: (r) => r.status, sortable: true },
        {
          id: "started",
          header: "Iniciado",
          accessor: (r) => <TimestampRelative isoString={r.started_at} />
        }
      ]}
    />
  );
}
