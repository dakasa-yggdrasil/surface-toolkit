import { Tooltip } from "@mui/material";

export interface TimestampRelativeProps {
  isoString: string;
}

function format(iso: string): string {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - target) / 1000);
  if (diffSec < 5) return "agora";
  if (diffSec < 60) return `há ${diffSec} segundo${diffSec === 1 ? "" : "s"}`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} minuto${diffMin === 1 ? "" : "s"}`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `há ${diffHr} hora${diffHr === 1 ? "" : "s"}`;
  const diffD = Math.floor(diffHr / 24);
  if (diffD < 30) return `há ${diffD} dia${diffD === 1 ? "" : "s"}`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function TimestampRelative({ isoString }: TimestampRelativeProps) {
  const absolute = new Date(isoString).toLocaleString("pt-BR");
  return (
    <Tooltip title={absolute}>
      <span>{format(isoString)}</span>
    </Tooltip>
  );
}
