import { useSurfaceQuery } from "../hooks/useSurfaceQuery";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { DataTable, type ColumnDef } from "../components/DataTable";

export interface ResourceItem extends Record<string, unknown> {
  id: string;
  name?: string;
  kind?: string;
}

export interface ResourcesTabProps {
  instanceId: string;
  integrationType: string;
  queryName?: string; // defaults "list-resources"
  columns?: ColumnDef<ResourceItem>[];
}

const defaultCols: ColumnDef<ResourceItem>[] = [
  { id: "name", header: "Nome", accessor: (r) => r.name ?? r.id, sortable: true },
  { id: "kind", header: "Tipo", accessor: (r) => r.kind ?? "—" }
];

export function ResourcesTab({ instanceId, queryName = "list-resources", columns = defaultCols }: ResourcesTabProps) {
  const { data, isLoading } = useSurfaceQuery<{ items: ResourceItem[] }>(instanceId, queryName);
  if (isLoading) return <LoadingState />;
  if (!data || !data.items || data.items.length === 0) {
    return <EmptyState title="Nenhum recurso" />;
  }
  return <DataTable<ResourceItem> rows={data.items} keyField="id" columns={columns} />;
}
