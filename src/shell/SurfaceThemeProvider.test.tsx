import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { SurfaceThemeProvider } from "./SurfaceThemeProvider";
import { useSurfaceColorScheme, COLOR_SCHEME_STORAGE_KEY } from "./colorScheme";
import { mockMatchMedia } from "../test-setup";

function htmlScheme() {
  return document.documentElement.getAttribute("data-theme");
}

function Probe() {
  const { scheme } = useSurfaceColorScheme();
  return <span data-testid="scheme">{scheme}</span>;
}

describe("SurfaceThemeProvider — color scheme", () => {
  it("sets data-theme on <html> from prefers-color-scheme (dark)", () => {
    mockMatchMedia(true); // system prefers dark
    render(
      <SurfaceThemeProvider>
        <Probe />
      </SurfaceThemeProvider>
    );
    expect(htmlScheme()).toBe("dark");
    expect(screen.getByTestId("scheme").textContent).toBe("dark");
  });

  it("sets data-theme from prefers-color-scheme (light) by default", () => {
    mockMatchMedia(false);
    render(
      <SurfaceThemeProvider>
        <Probe />
      </SurfaceThemeProvider>
    );
    expect(htmlScheme()).toBe("light");
  });

  it("toggle() flips the html attribute and persists the override", () => {
    mockMatchMedia(false);
    function ToggleButton() {
      const { toggle } = useSurfaceColorScheme();
      return (
        <button onClick={toggle} data-testid="t">
          toggle
        </button>
      );
    }
    render(
      <SurfaceThemeProvider>
        <ToggleButton />
        <Probe />
      </SurfaceThemeProvider>
    );

    expect(htmlScheme()).toBe("light");
    act(() => {
      screen.getByTestId("t").click();
    });
    expect(htmlScheme()).toBe("dark");
    expect(window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByTestId("scheme").textContent).toBe("dark");
  });

  it("a stored override beats the media query", () => {
    window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, "dark");
    mockMatchMedia(false); // system prefers light, but override says dark
    render(
      <SurfaceThemeProvider>
        <Probe />
      </SurfaceThemeProvider>
    );
    expect(htmlScheme()).toBe("dark");
    expect(screen.getByTestId("scheme").textContent).toBe("dark");
  });

  it("follows OS changes while there is NO manual override", () => {
    const mm = mockMatchMedia(false);
    render(
      <SurfaceThemeProvider>
        <Probe />
      </SurfaceThemeProvider>
    );
    expect(htmlScheme()).toBe("light");
    act(() => {
      mm.emit(true); // OS flips to dark
    });
    expect(htmlScheme()).toBe("dark");
  });

  it("ignores OS changes once a manual override is set", () => {
    const mm = mockMatchMedia(false);
    function ToggleButton() {
      const { setScheme } = useSurfaceColorScheme();
      return (
        <button onClick={() => setScheme("light")} data-testid="set-light">
          set
        </button>
      );
    }
    render(
      <SurfaceThemeProvider>
        <ToggleButton />
        <Probe />
      </SurfaceThemeProvider>
    );
    act(() => {
      screen.getByTestId("set-light").click(); // persist override = light
    });
    expect(window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe("light");
    act(() => {
      mm.emit(true); // OS flips to dark — must be ignored
    });
    expect(htmlScheme()).toBe("light");
  });

  it("renders a fixed theme toggle by default and hides it when asked", () => {
    mockMatchMedia(false);
    const { rerender } = render(
      <SurfaceThemeProvider>
        <div />
      </SurfaceThemeProvider>
    );
    // light scheme → action is to go dark
    expect(
      screen.getByRole("button", { name: "Mudar para tema escuro" })
    ).toBeInTheDocument();

    rerender(
      <SurfaceThemeProvider hideToggle>
        <div />
      </SurfaceThemeProvider>
    );
    expect(
      screen.queryByRole("button", { name: /Mudar para tema/ })
    ).toBeNull();
  });

  it("useSurfaceColorScheme outside the provider returns a no-op light default", () => {
    render(<Probe />);
    expect(screen.getByTestId("scheme").textContent).toBe("light");
  });
});
