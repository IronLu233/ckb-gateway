import type { Transaction } from "@ckb-lumos/base";
import type { BytesLike } from "@ckb-lumos/codec";

export enum GatewayMessageType {
  GatewayInit = "GatewayInit",
  RequestValidate = "RequestValidate",
  ValidateDone = "ValidateDone",
  RequestSignDigest = "RequestSignDigest",
  SignDigestDone = "SignDigestDone",
}

export type GatewayInteractionMessage<
  T extends GatewayMessageType,
  P extends object = {}
> = {
  type: T;
  payload: P;
};

type HashAlgorithm = "ckb-blake2b-256";
export type SupportedSigningType = "eth_personal_sign"; // TODO: support other wallet.

export const SigningType2HashAlgorithmMap: Record<
  SupportedSigningType,
  HashAlgorithm
> = {
  eth_personal_sign: "ckb-blake2b-256",
};

export type RequestGatewayMessage = GatewayInteractionMessage<
  GatewayMessageType.RequestValidate,
  {
    messageForSigning: BytesLike;
    rawTransaction: RawTransaction;
    hashContentExceptRawTx: BytesLike;
    signingType: SupportedSigningType;
  }
>;

export type GatewayInitMessage =
  GatewayInteractionMessage<GatewayMessageType.GatewayInit>;

export type ValidateDoneMessage = GatewayInteractionMessage<
  GatewayMessageType.ValidateDone,
  { success: boolean }
>;

export type RequestSignDigestMessage = GatewayInteractionMessage<
  GatewayMessageType.RequestSignDigest,
  {}
>;

export type SignDigestDoneMessage = GatewayInteractionMessage<
  GatewayMessageType.SignDigestDone,
  { success: true; signedMessage: string } | { success: false; reason: Error }
>;

export type RawTransaction = Pick<
  Transaction,
  "cellDeps" | "headerDeps" | "inputs" | "outputs" | "version" | "outputsData"
>;

export interface GatewayIO {
  postMessage(
    message: any,
    targetOrigin: string,
    transfer?: Transferable[]
  ): void;
  postMessage(message: any, options?: WindowPostMessageOptions): void;
  addEventListener(
    event: "message",
    listener: (event: MessageEvent) => void
  ): void;
}

export interface GatewayProviderIO extends GatewayIO {
  close(): void;
}
