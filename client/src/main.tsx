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
      token: { colorPrimary: "#167a43", colorInfo: "#167a43", colorSuccess: "#167a43", colorWarning: "#b7791f", colorError: "#c92a32", colorText: "#172318", colorTextSecondary: "#5b6a5e", colorBorder: "#dbe5d7", colorBgLayout: "#f4f7f1", borderRadius: 10, borderRadiusLG: 14, fontFamily: '"Noto Sans", system-ui, sans-serif', controlHeight: 42 },
      components: { Button: { fontWeight: 650, primaryShadow: "none" }, Table: { headerBg: "#f5f8f3", headerColor: "#516253", headerSplitColor: "#dbe5d7", rowHoverBg: "#f7faf5" }, Menu: { itemBorderRadius: 8, itemHeight: 44, itemMarginInline: 10 } }
    }}>
      <AntApp><BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter></AntApp>
    </ConfigProvider>
  </StrictMode>,
);

