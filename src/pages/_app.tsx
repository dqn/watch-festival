import "@/styles/index.css";

import { AppProps } from "next/app";
import * as React from "react";

import { NavigationBar } from "@/components/templates/NavigationBar";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <NavigationBar />
      <Component {...pageProps} />

      <style global jsx>{`
        html {
          font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue",
            "Yu Gothic", "YuGothic", Verdana, Meiryo, sans-serif;
        }
      `}</style>
    </>
  );
};

export default App;
