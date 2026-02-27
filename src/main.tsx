import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/* Showcase token injection  allows embedded iframes to authenticate */
const _sp = new URLSearchParams(window.location.search);
const _st = _sp.get("_st");
if (_st) localStorage.setItem("lily_access_token", _st);
if (_sp.has("_showcase")) document.documentElement.classList.add("showcase-mode");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
