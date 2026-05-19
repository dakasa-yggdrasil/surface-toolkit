import type { ComponentType } from "react";
import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Box, Stack, MenuItem, Select, FormControl } from "@mui/material";
import { Tabs, type TabDef, TabPanel } from "../components/Tabs";
import { PageHeader } from "../components/PageHeader";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { useCurrentCollaborator } from "../hooks/useCurrentCollaborator";
import { useTeam } from "../hooks/useTeam";
import { useDefaultInstance } from "../hooks/useDefaultInstance";

// Each tab inside the team-centric shell receives the resolved team id
// + the underlying integration instance id (so it can call surface
// queries against that adapter). integrationType is constant per surface.
export interface TeamTabProps {
  teamId: string;
  instanceId: string;
  integrationType: string;
}

export interface TeamTabDefinition {
  id: string;
  label: string;
  component: ComponentType<TeamTabProps>;
}

export interface TeamContextShellProps {
  integrationType: string;
  tabs: TeamTabDefinition[];
  basePath: string; // e.g. "/" — used to build deep links to /team/<id>/<tab>
  title?: string;
}

// The team-centric counterpart of IntegrationAdminShell. URL contract:
//
//   /                            → auto-routes to /team/<primary_team_id>
//   /team/:teamId                → first tab of the resolved team
//   /team/:teamId/:tabId         → renders that tab
//
// If the caller is anonymous (/me 401), we render a clear "sign in"
// empty state instead of crashing.
export function TeamContextShell({
  integrationType,
  tabs,
  basePath,
  title
}: TeamContextShellProps) {
  const { teamId: teamIdFromURL, tabId } = useParams<{ teamId: string; tabId: string }>();
  const { data: me, isLoading: loadingMe, error: meError } = useCurrentCollaborator();
  const teamId = teamIdFromURL ?? me?.collaborator?.primary_team_id;
  const { data: team, isLoading: loadingTeam } = useTeam(teamId);
  const { data: defaultInstanceId, isLoading: loadingInstance } = useDefaultInstance(integrationType);

  if (loadingMe) return <LoadingState />;

  if (meError || !me) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          title="Não foi possível identificar o usuário"
          description="Você precisa estar autenticado para usar a surface — abra o console com sessão válida."
        />
      </Box>
    );
  }

  // No team from URL and no primary set → user has no team yet.
  if (!teamId) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          title="Você ainda não tem um time"
          description="Peça pro admin do Yggdrasil te adicionar a um time para começar."
        />
      </Box>
    );
  }

  // First mount with no tabId in the URL → redirect to the first tab.
  const firstTabId = tabs[0]?.id ?? "overview";
  if (!teamIdFromURL) {
    return <Navigate replace to={`${basePath}team/${teamId}/${firstTabId}`} />;
  }
  if (!tabId) {
    return <Navigate replace to={`${basePath}team/${teamId}/${firstTabId}`} />;
  }

  if (loadingTeam || loadingInstance) return <LoadingState />;

  if (!defaultInstanceId) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          title={`Nenhuma instância de ${integrationType} configurada`}
          description="Crie uma integration_instance para que essa surface tenha contra quem consultar."
        />
      </Box>
    );
  }

  const memberships = me.memberships ?? [];
  const tabDefs: TabDef[] = tabs.map((t) => ({ id: t.id, label: t.label }));
  const tabBase = `${basePath}team/${teamId}`;

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title={title ?? team?.name ?? "Time"}
        subtitle={`${integrationType} · ${team?.slug ?? teamId}`}
        breadcrumb={[
          { label: "Console", to: "/" },
          { label: integrationType }
        ]}
      />
      <Stack spacing={2}>
        {memberships.length > 1 ? <TeamSwitcher me={me} basePath={basePath} /> : null}
        <Tabs items={tabDefs} basePath={tabBase} />
        {tabs.map((t) => {
          const Body = t.component;
          return (
            <TabPanel key={t.id} id={t.id}>
              <Body
                teamId={teamId}
                instanceId={defaultInstanceId}
                integrationType={integrationType}
              />
            </TabPanel>
          );
        })}
      </Stack>
    </Box>
  );
}

interface TeamSwitcherProps {
  me: { memberships?: Array<{ team_id: string; team_slug: string }> };
  basePath: string;
}

function TeamSwitcher({ me, basePath }: TeamSwitcherProps) {
  const memberships = me.memberships ?? [];
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [value, setValue] = useState(teamId ?? memberships[0]?.team_id ?? "");

  return (
    <FormControl size="small" sx={{ alignSelf: "flex-start", minWidth: 240 }}>
      <Select
        value={value}
        onChange={(e) => {
          const next = String(e.target.value);
          setValue(next);
          // React Router navigate keeps the BrowserRouter basename, so the
          // browser URL stays under /s/<surface>/.
          navigate(`${basePath}team/${next}/`);
        }}
      >
        {memberships.map((m) => (
          <MenuItem key={m.team_id} value={m.team_id}>
            {m.team_slug}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
