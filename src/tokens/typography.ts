export const typography = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  heading: {
    h1: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.25 },
    h3: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 }
  },
  body: { fontSize: "0.9375rem", fontWeight: 400, lineHeight: 1.6 },
  caption: { fontSize: "0.8125rem", fontWeight: 400, lineHeight: 1.5 },
  mono: 'ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace'
} as const;
