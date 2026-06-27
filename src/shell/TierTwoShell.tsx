import type { CSSProperties, ReactNode } from "react";

export interface TierTwoShellProps {
  /** Small uppercase amber label above the title. */
  eyebrow: string;
  /** Headline (Fraunces). */
  title: string;
  /** Supporting line under the title. */
  subtitle: ReactNode;
  /** Optional row of team chips under the subtitle. */
  teamChips?: ReactNode;
  /** Optional KPI row slot (typically a grid of <KpiTile>). */
  kpis?: ReactNode;
  /** Main content. */
  children: ReactNode;
  /** When set, renders the "Seguimos pro GitHub ↗" footer linking here. */
  githubHref?: string;
}

const ARROW = "↗";

/**
 * Presentational shell for a pillar-detail (tier-two) page (spec §5.3).
 *
 * Layout: eyebrow → Fraunces title → subtitle → teamChips row → KPI row slot →
 * children → a "Detalhe completo? Seguimos pro GitHub ↗" footer. Purely
 * presentational (no data fetching) and container-query friendly: the outer
 * wrapper sets `container-type: inline-size` so descendants can size by the
 * shell width via `@container`, not the viewport.
 */
export function TierTwoShell({
  eyebrow,
  title,
  subtitle,
  teamChips,
  kpis,
  children,
  githubHref
}: TierTwoShellProps) {
  const root: CSSProperties = {
    containerType: "inline-size",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "var(--sp-5)",
    fontFamily: "var(--font-body)",
    color: "var(--body)"
  };

  return (
    <section style={root} className="atelier">
      <header style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
        <span
          style={{
            fontSize: "var(--fs-xs)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--honey)"
          }}
        >
          {eyebrow}
        </span>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-heading)",
            fontSize: "var(--fs-2xl)",
            fontWeight: 600,
            lineHeight: 1.1,
            color: "var(--ink)"
          }}
        >
          {title}
        </h1>
        <div style={{ fontSize: "var(--fs-md)", color: "var(--mut)" }}>{subtitle}</div>
        {teamChips != null ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--sp-2)",
              marginTop: "var(--sp-1)"
            }}
          >
            {teamChips}
          </div>
        ) : null}
      </header>

      {kpis != null ? <div>{kpis}</div> : null}

      <div style={{ minWidth: 0 }}>{children}</div>

      {githubHref != null ? (
        <footer
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sp-2)",
            paddingTop: "var(--sp-4)",
            borderTop: "1px solid var(--line)",
            fontSize: "var(--fs-sm)",
            color: "var(--mut)"
          }}
        >
          <span>Detalhe completo? Seguimos pro GitHub</span>
          <a
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir no GitHub"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "1.4em",
              height: "1.4em",
              borderRadius: "var(--r-sm)",
              color: "var(--honey)",
              textDecoration: "none",
              fontWeight: 700
            }}
          >
            <span aria-hidden="true">{ARROW}</span>
          </a>
        </footer>
      ) : null}
    </section>
  );
}
