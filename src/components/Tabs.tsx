import type { ReactNode } from "react";
import { Tabs as MuiTabs, Tab } from "@mui/material";
import { useParams, useNavigate, useMatch } from "react-router-dom";

export interface TabDef {
  id: string;
  label: string;
}

export interface TabsProps {
  items: TabDef[];
  basePath: string; // e.g., "/parent"
}

export function Tabs({ items, basePath }: TabsProps) {
  const params = useParams<{ tabId: string }>();
  const navigate = useNavigate();
  const matchedBase = useMatch(`${basePath}/*`);
  const activeId = params.tabId ?? items[0]?.id ?? "";

  if (!matchedBase) return null;

  const handleChange = (_: unknown, value: string) => {
    navigate(`${basePath}/${value}`);
  };

  return (
    <MuiTabs value={activeId} onChange={handleChange} aria-label="surface tabs">
      {items.map((t) => (
        <Tab key={t.id} value={t.id} label={t.label} />
      ))}
    </MuiTabs>
  );
}

export interface TabPanelProps {
  id: string;
  children: ReactNode;
}

export function TabPanel({ id, children }: TabPanelProps) {
  const params = useParams<{ tabId: string }>();
  const activeId = params.tabId ?? "";
  if (activeId !== id) return null;
  return (
    <div role="tabpanel" id={`panel-${id}`}>
      {children}
    </div>
  );
}
