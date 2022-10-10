import EventEmitter2, { ListenerFn } from "eventemitter2";
import { bytes } from "@ckb-lumos/codec";
import { validateP2PKHMessage } from "@ckb-lumos/helpers/lib/validate";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { List } from "immutable";
import { ETHPersonalSign, WalletSigningMethod } from "./WalletSigningMethod";
import {
  GatewayInitMessage,
  GatewayInteractionMessage,
  GatewayMessageType,
  RequestValidateMessage,
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

  validatePayload: RequestValidateMessage["payload"] | null = null;

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

  opener: Window | undefined = window.opener;

  private postMessageToOpenerWindow<T, P extends object = {}>(
    message: T extends GatewayMessageType
      ? GatewayInteractionMessage<T, P>
      : never
  ) {
    if (this.opener) {
      this.opener.postMessage(message);
    }
  }

  public init() {
    if (typeof window === "undefined") {
      return;
    }

    this.postMessageToOpenerWindow({
      type: GatewayMessageType.GatewayInit,
      payload: {},
    } as GatewayInitMessage);

    window.addEventListener(
      "message",
      (event: MessageEvent<GatewayInteractionMessage<any, any>>) => {
        switch (event.data.type) {
          case GatewayMessageType.RequestValidate: {
            this.validatePayload = event.data.payload;
            this.validateTransaction();
            return;
          }
          case GatewayMessageType.RequestSign: {
            this.requestSign();
          }
        }
        if (event.data.type === GatewayMessageType.RequestValidate) {
          this.validateTransaction();
        }
      }
    );
  }

  /**
   * Validate an transaction
   */
  private async validateTransaction() {
    if (!this.validatePayload) {
      throw new Error("Not receive any payload");
    }
    if (this.validated) {
      return;
    }

    let { messageForSigning, txSkeleton, hashContentExceptRawTx } =
      this.validatePayload;

    txSkeleton = TransactionSkeleton({
      cellDeps: List(txSkeleton.cellDeps),
      headerDeps: List(txSkeleton.headerDeps),
      inputs: List(txSkeleton.inputs),
      outputs: List(txSkeleton.outputs),
      witnesses: List(txSkeleton.witnesses),
    });
    const isValid = validateP2PKHMessage(
      messageForSigning,
      TransactionSkeleton(txSkeleton),
      hashContentExceptRawTx
    );

    this.validated = true;
    this._isValid = isValid;

    this.emit(
      isValid ? "ValidateSuccess" : "ValidateFailed",
      this.validatePayload
    );
    return isValid;
  }

  async requestSign() {
    if (!this.validated) {
      throw new Error("Not validated yet, please call `validate` first.");
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
      this.emit("SignSuccess", { signedMessage });
    } catch (e) {
      this.emit("SignFailed", { reason: e });
      throw e;
    }

    return this.signedMessage;
  }

  on(
    event: "ValidateSuccess",
    listener: (payload: RequestValidateMessage["payload"]) => unknown
  ): this;
  on(
    event: "ValidateFailed",
    listener: (payload: RequestValidateMessage["payload"]) => unknown
  ): this;
  on(
    event: "SignSuccess",
    listener: (payload: { signedMessage: string }) => unknown
  ): this;
  on(
    event: "SignFailed",
    listener: (payload: { error: Error }) => unknown
  ): this;
  override on(
    event: "ValidateSuccess" | "ValidateFailed" | "SignSuccess" | "SignFailed",
    listener: ListenerFn
  ) {
    return super.on(event, (payload) => {
      this.postMessageToOpenerWindow({
        type: event as GatewayMessageType,
        payload,
      });
      listener(payload);
    });
  }

  override emit(
    event: "ValidateSuccess" | "ValidateFailed" | "SignSuccess" | "SignFailed",
    payload: Record<any, any>
  ) {
    return super.emit(event, payload);
  }
}

export { GatewayMessageType };
