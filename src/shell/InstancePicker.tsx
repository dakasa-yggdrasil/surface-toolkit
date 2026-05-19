import { Link as RouterLink } from "react-router-dom";
import { Box, Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import { useInstancesList } from "../hooks/useInstancesList";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";

export interface InstancePickerProps {
  integrationType: string;
  // Where to deep-link each card. Receives the instance id and should
  // return the path relative to the surface's basename (e.g. "/instance/<id>").
  hrefForInstance: (instanceId: string) => string;
  title?: string;
  subtitle?: string;
}

// Shown on the "/" route of every surface. Lists all configured instances
// of this integration type so the operator can drill into one.
export function InstancePicker({
  integrationType,
  hrefForInstance,
  title,
  subtitle
}: InstancePickerProps) {
  const { data, isLoading, error } = useInstancesList(integrationType);

  if (isLoading) return <LoadingState />;
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          title="Não foi possível carregar instâncias"
          description={String(error instanceof Error ? error.message : error)}
        />
      </Box>
    );
  }
  const instances = data ?? [];
  if (instances.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title={title ?? `Surface ${integrationType}`} subtitle={subtitle} />
        <EmptyState
          title={`Nenhuma instância de ${integrationType}`}
          description="Crie uma integration_instance no Yggdrasil para começar."
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title={title ?? `Surface ${integrationType}`}
        subtitle={subtitle ?? "Selecione uma instância para administrar"}
      />
      <Stack
        direction="row"
        spacing={2}
        sx={{ flexWrap: "wrap", gap: 2, mt: 1 }}
      >
        {instances.map((inst) => (
          <Card
            key={inst.id}
            variant="outlined"
            sx={{ minWidth: 280, maxWidth: 360, flex: "1 1 280px" }}
          >
            <CardActionArea component={RouterLink} to={hrefForInstance(inst.id)}>
              <CardContent>
                <Typography variant="h4" component="div" gutterBottom>
                  {inst.name ?? inst.id}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                  {inst.id}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
