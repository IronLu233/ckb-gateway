import EventEmitter2, { Listener, ListenerFn } from "eventemitter2";
import {
  GatewayMessageType,
  RawTransaction,
  RequestGatewayMessage,
  SignDigestDoneMessage,
  ValidateDoneMessage,
} from "./shared";
import { BytesLike } from "@ckb-lumos/codec";

export class WalletGatewaySender extends EventEmitter2 {
  constructor(readonly gatewayURL: string) {
    super();
  }

  gatewayWindow: Window | null = null;

  /**
   * Request validate and sign a digest in gateway.
   * This method will open a gateway page in a new window.
   */
  async requestGatewaySignDigest(
    messageForSigning: BytesLike,
    rawTransaction: RawTransaction,
    hashContentExceptRawTx: BytesLike,
    signingType: "eth_personal_sign"
  ) {
    const origin = new URL(this.gatewayURL).origin;
    const gatewayWindow = (this.gatewayWindow = window.open(this.gatewayURL));
    if (!gatewayWindow) {
      throw new Error("Failed to open gateway window");
    }
    await new Promise<void>((resolve) => {
      window.addEventListener("message", (event) => {
        this.emit(event.data.type, event.data.payload);
        if (event.data.type === GatewayMessageType.GatewayInit) {
          resolve();
        }
      });
    });

    gatewayWindow.postMessage(
      {
        type: GatewayMessageType.RequestValidate,
        payload: {
          messageForSigning: messageForSigning,
          rawTransaction: rawTransaction,
          hashContentExceptRawTx: hashContentExceptRawTx,
          signingType,
        },
      } as RequestGatewayMessage,
      origin
    );
  }

  /**
   * Close the opening gateway window
   */
  closeGateway() {
    this.gatewayWindow?.close();
  }

  on(
    event: "ValidateDone",
    listener: (
      payload: ValidateDoneMessage["payload"] & RequestGatewayMessage["payload"]
    ) => unknown
  ): this | Listener;
  on(
    event: "SignDigestDone",
    listener: (payload: SignDigestDoneMessage["payload"]) => unknown
  ): this | Listener;
  on(event: never, listener: ListenerFn) {
    return super.on(event, listener);
  }
}
