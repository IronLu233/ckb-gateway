import EventEmitter2, { Listener, ListenerFn } from "eventemitter2";
import {
  GatewayMessageType,
  GatewayProviderIO,
  RawTransaction,
  RequestGatewayMessage,
  SignDigestDoneMessage,
  ValidateDoneMessage,
} from "../shared";
import { BytesLike } from "@ckb-lumos/codec";
import { getGatewayProviderIOOpener } from "./GatewayProviderIO";
import { getSelfProcessIO } from "../SelfProcessIO";

const selfProcessIO = getSelfProcessIO();

export class WalletGatewayClient extends EventEmitter2 {
  constructor(readonly gatewayURL: string) {
    super();
  }

  gatewayProviderIO: GatewayProviderIO | null = null;

  /**
   * Request validate and sign a digest in gateway.
   * This method will open a gateway app
   */
  async requestGatewaySignDigest(
    messageForSigning: BytesLike,
    rawTransaction: RawTransaction,
    hashContentExceptRawTx: BytesLike,
    signingType: "eth_personal_sign"
  ) {
    const origin = new URL(this.gatewayURL).origin;
    const gatewayProvider = getGatewayProviderIOOpener();
    const gatewayProviderIO = (this.gatewayProviderIO = gatewayProvider.open(
      this.gatewayURL
    ));
    if (!gatewayProviderIO) {
      throw new Error("Failed to open gateway provider");
    }
    await new Promise<void>((resolve) => {
      selfProcessIO.addEventListener("message", (event) => {
        this.emit(event.data.type, event.data.payload);
        if (event.data.type === GatewayMessageType.GatewayInit) {
          resolve();
        }
      });
    });

    gatewayProviderIO.postMessage(
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
   * Close the opening gateway application
   */
  closeGateway() {
    this.gatewayProviderIO?.close();
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
