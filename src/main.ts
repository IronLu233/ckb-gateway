import EventEmitter2, { Listener, ListenerFn } from "eventemitter2";
import { bytes } from "@ckb-lumos/codec";
import { validateP2PKHMessage } from "@ckb-lumos/helpers/lib/validate";
import { ETHPersonalSign, WalletSigningMethod } from "./WalletSigningMethod";
import {
  GatewayInitMessage,
  GatewayInteractionMessage,
  GatewayMessageType,
  RequestGatewayMessage,
  SignDigestDoneMessage,
  SigningType2HashAlgorithmMap,
  ValidateDoneMessage,
} from "./shared";
import type { WalletGatewaySender } from "./client";

/**
 * WalletGatewayReceiver is a class that receives messages from {@link WalletGatewaySender}.
 */
export class WalletGatewayReceiver extends EventEmitter2 {
  /**
   * has validate transaction and it's digest.
   */
  validated = false;

  /**
   * Signed message by wallet.
   */
  private signedMessage = "";

  private _isValid = false;

  validatePayload: RequestGatewayMessage["payload"] | null = null;

  constructor() {
    super();
  }

  /**
   * Is the transaction valid, only available after `validate` is called.
   */
  get isValid() {
    if (!this.validated) {
      throw new Error("Not validated yet");
    }

    return this._isValid;
  }

  /**
   * The opener window reference of gateway window
   */
  private opener: Window | null = window.opener;

  private postMessageToOpenerWindow<T, P extends object = {}>(
    message: T extends GatewayMessageType
      ? GatewayInteractionMessage<T, P>
      : never
  ) {
    if (this.opener) {
      this.opener.postMessage(message, "*");
    }
  }

  /**
   * init the gateway receiver. tells the opener window that the gateway is ready.
   */
  public init() {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener(
      "message",
      (event: MessageEvent<GatewayInteractionMessage<any, any>>) => {
        switch (event.data.type) {
          case GatewayMessageType.RequestValidate: {
            this.validatePayload = event.data.payload;
            this.validateTransaction();
            return;
          }
          case GatewayMessageType.RequestSignDigest: {
            this.requestSignDigest();
          }
        }
        if (event.data.type === GatewayMessageType.RequestValidate) {
          this.validateTransaction();
        }
      }
    );

    this.postMessageToOpenerWindow({
      type: GatewayMessageType.GatewayInit,
      payload: {},
    } as GatewayInitMessage);
  }

  private async validateTransaction() {
    if (!this.validatePayload) {
      throw new Error("Not receive any payload");
    }
    if (this.validated) {
      return;
    }

    let {
      messageForSigning,
      rawTransaction,
      hashContentExceptRawTx,
      signingType,
    } = this.validatePayload;

    const hashAlgorithm = SigningType2HashAlgorithmMap[signingType];

    const success = validateP2PKHMessage(
      messageForSigning,
      rawTransaction,
      hashContentExceptRawTx,
      hashAlgorithm
    );

    this.validated = true;
    this._isValid = success;

    this.emit("ValidateDone", { success: success, ...this.validatePayload });
    return success;
  }

  /**
   * Request the wallet to sign the digest.
   */
  async requestSignDigest() {
    if (!this.validated) {
      throw new Error(
        "Not validated yet, please wait gateway caller's validate request"
      );
    }
    if (!this.validatePayload) {
      throw new Error("Not receive any payload");
    }

    const { signingType, messageForSigning } = this.validatePayload;

    let signingMethod: WalletSigningMethod;
    switch (signingType) {
      case "eth_personal_sign":
        signingMethod = ETHPersonalSign;
        break;
      default:
        throw new Error("Unsupported signing type");
    }

    try {
      const signedMessage = await signingMethod(
        bytes.hexify(messageForSigning)
      );
      this.emit("SignDigestDone", { signedMessage, success: true });
      this.postMessageToOpenerWindow({
        type: GatewayMessageType.SignDigestDone,
        payload: {
          success: true,
          signedMessage,
        },
      });
    } catch (e) {
      this.emit("SignDigestDone", { reason: e as Error, success: false });
      this.postMessageToOpenerWindow({
        type: GatewayMessageType.SignDigestDone,
        payload: {
          success: false,
        },
      });

      throw e;
    }

    return this.signedMessage;
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
  /**
   * @internal
   */
  on(event: never, listener: ListenerFn) {
    return super.on(event, listener);
  }

  emit(
    event: "ValidateDone",
    payload: ValidateDoneMessage["payload"] & RequestGatewayMessage["payload"]
  ): boolean;
  emit(
    event: "SignDigestDone",
    payload: SignDigestDoneMessage["payload"]
  ): boolean;

  /**
   * @internal
   */
  emit(event: never, payload: Record<any, any>) {
    return super.emit(event as string, payload);
  }
}

export { GatewayMessageType };
