import React from "react";
import { createRoot } from "react-dom/client";

import App from "./app/App";
import "./styles/globals.css";
import "./styles/shared.css";
import "./styles/layout.css";
import "./styles/themes/theme-10.css";

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
