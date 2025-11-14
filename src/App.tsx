import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Vocabulary from "./pages/Vocabulary";
import SpacedRepetition from "./pages/SpacedRepetition";
import { useServiceWorker } from "./hooks/useServiceWorker";

const basePath = (() => {
  const rawBase = import.meta.env.BASE_URL || "/";
  if (rawBase === "/") return rawBase;
  return rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;
})();

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/vocabulary" component={Vocabulary} />
      <Route path="/spaced-repetition" component={SpacedRepetition} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route path="/:rest*" component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  useServiceWorker();
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={basePath}>
            <AppRoutes />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
