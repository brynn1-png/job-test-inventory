import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App as AntApp, ConfigProvider } from "antd";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider theme={{
      token: { colorPrimary: "#2563eb", colorInfo: "#2563eb", colorSuccess: "#16824b", colorWarning: "#b7791f", colorError: "#c92a32", colorText: "#172033", colorTextSecondary: "#5e687a", colorBorder: "#dde3ed", colorBgLayout: "#f5f7fb", borderRadius: 10, borderRadiusLG: 14, fontFamily: '"Noto Sans", system-ui, sans-serif', controlHeight: 42 },
      components: { Button: { fontWeight: 650, primaryShadow: "none" }, Table: { headerBg: "#f5f7fb", headerColor: "#536078", headerSplitColor: "#dde3ed", rowHoverBg: "#f7f9fd" }, Menu: { itemBorderRadius: 8, itemHeight: 44, itemMarginInline: 10 } }
    }}>
      <AntApp><BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter></AntApp>
    </ConfigProvider>
  </StrictMode>,
);
