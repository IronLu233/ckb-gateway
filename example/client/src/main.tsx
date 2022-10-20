import { predefined, initializeConfig } from "@ckb-lumos/config-manager";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
const CONFIG = predefined.AGGRON4;
initializeConfig(CONFIG);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
