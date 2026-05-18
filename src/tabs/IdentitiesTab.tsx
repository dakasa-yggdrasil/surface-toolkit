import { Stack } from "@mui/material";
import { useIdentities } from "../hooks/useIdentities";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { IdentityRow } from "../components/IdentityRow";

export interface IdentitiesTabProps {
  instanceId: string;
  integrationType: string;
}

export function IdentitiesTab({ instanceId, integrationType }: IdentitiesTabProps) {
  const { data, isLoading } = useIdentities({ instanceId, integrationType });
  if (isLoading) return <LoadingState />;
  if (!data || data.items.length === 0) {
    return <EmptyState title="Nenhuma identidade vinculada" description="As identidades aparecem após o primeiro onboard." />;
  }
  return (
    <Stack>
      {data.items.map((id) => (
        <IdentityRow key={id.id} identity={id} />
      ))}
    </Stack>
  );
}
