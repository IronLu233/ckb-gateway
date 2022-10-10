import EventEmitter2 from "eventemitter2";
import { GatewayMessageType } from "./shared";
import { BytesLike, bytes } from "@ckb-lumos/codec";
import { TransactionSkeletonType } from "@ckb-lumos/helpers";

export class WalletGatewaySender extends EventEmitter2 {
  constructor(readonly gatewayURL = "//localhost:1234") {
    super();
  }

  async requestValidate(
    messageForSigning: BytesLike,
    txSkeleton: TransactionSkeletonType,
    hashContentExceptRawTx: BytesLike,
    hashAlgorithm = "ckb-blake2b-256"
  ) {
    const gatewayWindow = window.open(this.gatewayURL);
    if (!gatewayWindow) {
      throw new Error("Failed to open gateway window");
    }
    await new Promise((resolve, reject) => {
      gatewayWindow.addEventListener("message", (event) => {
        this.emit(event.data.type, event.data.payload);
      });
    });

    gatewayWindow.postMessage({
      type: GatewayMessageType.RequestValidate,
      payload: {
        messageForSigning: bytes.hexify(messageForSigning),
        txSkeleton: txSkeleton.toJSON(),
        hashContentExceptRawTx: bytes.hexify(hashContentExceptRawTx),
        hashAlgorithm,
      },
    });
  }
}
