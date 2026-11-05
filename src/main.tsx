import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";
import "./App.css";

import "./themes/theme-01.css";
import "./themes/theme-02.css";
import "./themes/theme-03.css";
import "./themes/theme-04.css";
import "./themes/theme-05.css";
import "./themes/theme-06.css";
import "./themes/theme-07.css";
import "./themes/theme-08.css";
import "./themes/theme-09.css";
import "./themes/theme-10.css";
import "./themes/theme-11.css";
import "./layout.css";

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
