import type { AppProps } from "next/app";
import Head from "next/head";
import * as React from "react";

import { NavigationBar } from "@/components/templates/NavigationBar";

import "@/styles/index.css";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Watch Festival</title>
      </Head>

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
