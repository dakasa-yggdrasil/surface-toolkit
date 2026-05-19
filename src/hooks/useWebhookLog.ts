import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface WebhookEventT {
  id: string;
  event_type: string;
  signature_verified: boolean;
  received_at: string;
  payload_preview?: string;
}

export interface WebhookLogResult {
  items: WebhookEventT[];
  total: number;
}

interface OpsAuditResponse {
  events?: Array<{
    id: string;
    actor?: string;
    action: string;
    target_kind?: string;
    target_id?: string;
    result_status?: string;
    created_at: string;
  }>;
  count?: number;
}

// /ops/audit filtered by action_prefix=webhook. Audit entries don't
// expose payload bodies, so payload_preview is left undefined — surfaces
// can drill into the underlying integration-{type} adapter if they need
// the full event body.
export function useWebhookLog(instanceId: string | undefined, limit = 50) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["webhook-log", instanceId, limit],
    enabled: !!instanceId,
    queryFn: async (): Promise<WebhookLogResult> => {
      const resp = await api.get<OpsAuditResponse>(
        `/ops/audit?action_prefix=webhook&limit=${limit}`
      );
      const items: WebhookEventT[] = (resp.events ?? []).map((e) => ({
        id: e.id,
        event_type: e.action.replace(/^webhook\./, ""),
        signature_verified: e.result_status === "success",
        received_at: e.created_at
      }));
      return { items, total: resp.count ?? items.length };
    },
    staleTime: 10_000
  });
}
