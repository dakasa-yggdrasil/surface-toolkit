import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, AlertTitle, Box } from "@mui/material";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          <AlertTitle>Erro inesperado</AlertTitle>
          {error.message}
        </Alert>
      </Box>
    );
  }
}
