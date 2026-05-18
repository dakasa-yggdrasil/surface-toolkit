import { useWebhookLog, type WebhookEventT } from "../hooks/useWebhookLog";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { DataTable } from "../components/DataTable";
import { TimestampRelative } from "../components/TimestampRelative";

export interface WebhookLogTabProps {
  instanceId: string;
  integrationType: string;
}

export function WebhookLogTab({ instanceId }: WebhookLogTabProps) {
  const { data, isLoading } = useWebhookLog(instanceId);
  if (isLoading) return <LoadingState />;
  if (!data || data.items.length === 0) {
    return <EmptyState title="Nenhum webhook recebido" />;
  }
  return (
    <DataTable<WebhookEventT>
      rows={data.items}
      keyField="id"
      columns={[
        { id: "event", header: "Evento", accessor: (r) => r.event_type, sortable: true },
        {
          id: "verified",
          header: "Assinatura",
          accessor: (r) => (r.signature_verified ? "✓" : "✗")
        },
        {
          id: "received",
          header: "Recebido",
          accessor: (r) => <TimestampRelative isoString={r.received_at} />
        }
      ]}
    />
  );
}
