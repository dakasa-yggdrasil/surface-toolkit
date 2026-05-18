import { Box } from "@mui/material";
import { typography } from "../tokens/typography";

export interface JsonViewerProps {
  value: unknown;
}

export function JsonViewer({ value }: JsonViewerProps) {
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 2,
        bgcolor: "grey.50",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        fontFamily: typography.mono,
        fontSize: "0.8125rem",
        overflow: "auto"
      }}
    >
      {JSON.stringify(value, null, 2)}
    </Box>
  );
}
