import { useActionCatalog } from "../hooks/useActionCatalog";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { DataTable } from "../components/DataTable";
import type { ActionDef } from "../hooks/useActionCatalog";

export interface ActionsTabProps {
  instanceId: string;
  integrationType: string;
}

export function ActionsTab({ integrationType }: ActionsTabProps) {
  const { data, isLoading } = useActionCatalog(integrationType);
  if (isLoading) return <LoadingState />;
  if (!data || data.items.length === 0) {
    return <EmptyState title="Nenhuma action declarada" />;
  }
  return (
    <DataTable<ActionDef>
      rows={data.items}
      keyField="name"
      columns={[
        { id: "name", header: "Action", accessor: (r) => r.name, sortable: true },
        {
          id: "resources",
          header: "Resources",
          accessor: (r) => (r.resource_types ? r.resource_types.join(", ") : "—")
        }
      ]}
    />
  );
}
