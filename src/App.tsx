import React from "react";
import AppRoutes from "./routes";
import "antd/dist/reset.css";
import { ConfigProvider } from "antd";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#005faa",
        },
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
};

export default App;
