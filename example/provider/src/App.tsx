import { FC, useEffect, useRef } from "react";
import { WalletGatewayProvider } from "ckb-gateway";
import { useSetState } from "react-use";

const App: FC = () => {
  const { current: receiver } = useRef(new WalletGatewayProvider());
  const [state, setState] = useSetState({} as any);
  useEffect(() => {
    receiver.init();
    receiver.on(
      "ValidateDone",
      ({
        messageForSigning,
        rawTransaction,
        hashContentExceptRawTx,
        success,
      }) => {
        setState({
          messageForSigning,
          rawTransaction,
          hashContentExceptRawTx,
          isValid: success,
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
            receiver.requestSignDigest();
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

export default App;
