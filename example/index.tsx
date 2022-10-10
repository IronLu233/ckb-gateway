import React, { FC, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { WalletGatewayReceiver } from "ckb-gateway/dist/main";
import { useSetState } from "react-use";

const App: FC = () => {
  const { current: receiver } = useRef(new WalletGatewayReceiver());
  const [state, setState] = useSetState({} as any);
  useEffect(() => {
    receiver.init();
    receiver.on(
      "ValidateSuccess",
      ({ messageForSigning, txSkeleton, hashContentExceptRawTx }) => {
        setState({
          messageForSigning,
          txSkeleton,
          hashContentExceptRawTx,
          isValid: true,
        });
      }
    );
  }, []);

  const messageContent = !!state.messageForSigning && (
    <div>
      <div>messageForSigning: {state.messageForSigning}</div>
      <div>{state.isValid ? "Verify Pass" : "Verify Failed"}</div>
      {state.isValid && (
        <button
          onClick={() => {
            receiver.requestSign();
          }}
        >
          Sign
        </button>
      )}
    </div>
  );

  return (
    <div>
      {state.messageForSigning ? (
        messageContent
      ) : (
        <div>Waiting message for validate</div>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
