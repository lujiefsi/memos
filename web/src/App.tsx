import { useColorScheme } from "@mui/joy";
import { useEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { RouterProvider } from "react-router-dom";
import { globalService, locationService } from "./services";
import { useAppSelector } from "./store";
import router from "./router";
import * as storage from "./helpers/storage";
import { getSystemColorScheme } from "./helpers/utils";
import Loading from "./pages/Loading";

function App() {
  const { i18n } = useTranslation();
  const { appearance, locale, systemStatus } = useAppSelector((state) => state.global);
  const { mode, setMode } = useColorScheme();

  useEffect(() => {
    locationService.updateStateWithLocation();
    window.onpopstate = () => {
      locationService.updateStateWithLocation();
    };
  }, []);

  useEffect(() => {
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      if (globalService.getState().appearance === "system") {
        const mode = e.matches ? "dark" : "light";
        setMode(mode);
      }
    };

    try {
      if (darkMediaQuery.addEventListener) {
        darkMediaQuery.addEventListener("change", handleColorSchemeChange);
      } else {
        darkMediaQuery.addListener(handleColorSchemeChange);
      }
    } catch (error) {
      console.error("failed to initial color scheme listener", error);
    }
  }, []);

  // Inject additional style and script codes.
  useEffect(() => {
    if (systemStatus.additionalStyle) {
      const styleEl = document.createElement("style");
      styleEl.innerHTML = systemStatus.additionalStyle;
      styleEl.setAttribute("type", "text/css");
      document.head.appendChild(styleEl);
    }
    if (systemStatus.additionalScript) {
      const scriptEl = document.createElement("script");
      scriptEl.innerHTML = systemStatus.additionalScript;
      document.head.appendChild(scriptEl);
    }
  }, [systemStatus]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
    i18n.changeLanguage(locale);
    storage.set({
      locale: locale,
    });
  }, [locale]);

  useEffect(() => {
    storage.set({
      appearance: appearance,
    });

    let currentAppearance = appearance;
    if (appearance === "system") {
      currentAppearance = getSystemColorScheme();
    }

    setMode(currentAppearance);
  }, [appearance]);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "light") {
      root.classList.remove("dark");
    } else if (mode === "dark") {
      root.classList.add("dark");
    }
  }, [mode]);

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
