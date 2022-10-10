import React, { FC, useEffect } from "react";
import ReactDOM from "react-dom";
import { WalletGateway } from "ckb-gateway/dist/main";

const App: FC = () => {
  useEffect(() => {
    const eventListener = (event: MessageEvent) => {
      const { type } = event.data || {};
    };

    window.addEventListener("message", eventListener);
    return () => {
      window.removeEventListener("message", eventListener);
    };
  });

  return <div>Hello, world</div>;
};

ReactDOM.render(<App />, document.getElementById("root"));
