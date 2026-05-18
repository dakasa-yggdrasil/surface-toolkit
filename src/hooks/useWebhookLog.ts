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

export function useWebhookLog(instanceId: string | undefined, limit = 50) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["webhook-log", instanceId, limit],
    enabled: !!instanceId,
    queryFn: () =>
      api.get<WebhookLogResult>(
        `/audit-events?source=webhook&integration_id=${instanceId}&limit=${limit}&order=desc`
      ),
    staleTime: 10_000
  });
}
