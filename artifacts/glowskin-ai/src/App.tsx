import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import ScanPage from "@/pages/scan";
import ResultsPage from "@/pages/results";
import EnvironmentalRiskPage from "@/pages/environmental-risk";
import HabitCoachPage from "@/pages/habit-coach";
import VoicePage from "@/pages/voice";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/scan" component={ScanPage} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/environmental-risk" component={EnvironmentalRiskPage} />
      <Route path="/habit-coach" component={HabitCoachPage} />
      <Route path="/voice" component={VoicePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
