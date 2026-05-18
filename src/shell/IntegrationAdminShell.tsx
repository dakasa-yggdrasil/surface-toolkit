import type { ComponentType } from "react";
import { Box, Stack } from "@mui/material";
import { useParams, Navigate } from "react-router-dom";
import { Tabs, type TabDef, TabPanel } from "../components/Tabs";
import { PageHeader } from "../components/PageHeader";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { useInstance } from "../hooks/useInstance";

export interface TabDefinition {
  id: string;
  label: string;
  component: ComponentType<{ instanceId: string; integrationType: string }>;
}

export interface IntegrationAdminShellProps {
  integrationType: string;
  tabs: TabDefinition[];
  basePath: string; // e.g., "/s/slack"
  title?: string;
  subtitle?: string;
}

export function IntegrationAdminShell({
  integrationType,
  tabs,
  basePath,
  title,
  subtitle
}: IntegrationAdminShellProps) {
  const { instanceId, tabId } = useParams<{ instanceId: string; tabId: string }>();
  const { data: instance, isLoading, error } = useInstance(instanceId);

  if (!instanceId) return <EmptyState title="Instance ausente" description="URL inválida." />;
  if (isLoading) return <LoadingState />;
  if (error || !instance) {
    return <EmptyState title="Instance não encontrada" description="Verifique se ela ainda existe." />;
  }

  const firstTabId = tabs[0]?.id ?? "overview";
  if (!tabId) {
    return <Navigate replace to={`${basePath}/instance/${instanceId}/${firstTabId}`} />;
  }

  const tabDefs: TabDef[] = tabs.map((t) => ({ id: t.id, label: t.label }));
  const tabBase = `${basePath}/instance/${instanceId}`;

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title={title ?? instance.name ?? instance.id}
        subtitle={subtitle ?? integrationType}
        breadcrumb={[
          { label: "Integrações", to: "/ops/integrations" },
          { label: integrationType }
        ]}
      />
      <Stack spacing={2}>
        <Tabs items={tabDefs} basePath={tabBase} />
        {tabs.map((t) => {
          const Body = t.component;
          return (
            <TabPanel key={t.id} id={t.id}>
              <Body instanceId={instanceId} integrationType={integrationType} />
            </TabPanel>
          );
        })}
      </Stack>
    </Box>
  );
}
