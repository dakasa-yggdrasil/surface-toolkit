import type { ReactNode } from "react";
import { Stack, Typography, Breadcrumbs, Link as MuiLink, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { spacing } from "../tokens/spacing";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumb, actions }: PageHeaderProps) {
  return (
    <Box sx={{ pb: `${spacing.md}px`, borderBottom: 1, borderColor: "divider", mb: `${spacing.lg}px` }}>
      {breadcrumb && breadcrumb.length > 0 ? (
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          {breadcrumb.map((item, idx) => {
            const last = idx === breadcrumb.length - 1;
            if (last || !item.to) {
              return (
                <Typography key={idx} color="text.primary" variant="body2">
                  {item.label}
                </Typography>
              );
            }
            return (
              <MuiLink key={idx} component={RouterLink} to={item.to} variant="body2" underline="hover">
                {item.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      ) : null}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {actions}
      </Stack>
    </Box>
  );
}
