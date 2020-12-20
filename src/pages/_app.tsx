import type { AppProps } from "next/app";
import Head from "next/head";
import * as React from "react";
import { CookiesProvider } from "react-cookie";

import { NavigationBar } from "@/components/templates/NavigationBar";
import "@/styles/index.css";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Watch Festival</title>
      </Head>

      <CookiesProvider>
        <NavigationBar />
        <Component {...pageProps} />
      </CookiesProvider>

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
