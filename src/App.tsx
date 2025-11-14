import { ErrorBoundary, LocationProvider, Route, Router } from 'preact-iso';
import "./App.css";
import { FileList } from "./routes/file-list/index";
import { MindMap } from "./routes/mind-map/index";
import { SettingsPage } from "./routes/settings/index";

function App() {

  return (
    <LocationProvider>
      <ErrorBoundary>
        <main class="w-full h-full">
          <Router>
            {/* Using Route component - better for TypeScript */}
            <Route path="/" component={MindMap} />
            <Route path="/files" component={FileList} />
            <Route path="/settings" component={SettingsPage} />
          </Router>
        </main>
      </ErrorBoundary>
    </LocationProvider>
  );
}

export default App;
