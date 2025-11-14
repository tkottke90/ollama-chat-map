import { hydrate } from "preact-iso";
import App from "./App";
import { RegisterNodes } from './components/nodes';

// Register the nodes before startup
RegisterNodes();

// Hydrate the application
hydrate(<App />, document.getElementById("root")!);
