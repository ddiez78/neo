import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProjectDashboard from "./pages/ProjectDashboard";
import ScriptEditor from "./pages/ScriptEditor";
import StoryBible from "./pages/StoryBible";
import SceneBreakdown from "./pages/SceneBreakdown";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects/:projectId" component={ProjectDashboard} />
      <Route path="/projects/:projectId/script" component={ScriptEditor} />
      <Route path="/projects/:projectId/story-bible" component={StoryBible} />
      <Route path="/projects/:projectId/scenes" component={SceneBreakdown} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
