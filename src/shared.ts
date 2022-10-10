import type { TransactionSkeletonType } from "@ckb-lumos/helpers";
import type { BytesLike } from "@ckb-lumos/codec";

export enum GatewayMessageType {
  GatewayInit = "GatewayInit",
  RequestValidate = "RequestValidate",
  ValidateSuccess = "ValidateSuccess",
  ValidateFailed = "ValidateFailed",
  RequestSign = "RequestSign",
  SignSuccess = "SignSuccess",
  SignFailed = "SignFailed",
}

export type GatewayInteractionMessage<
  T extends GatewayMessageType,
  P extends object = {}
> = {
  type: T;
  payload: P;
};

type HashAlgorithm = "ckb-blake2b-256";
export type RequestValidateMessage = GatewayInteractionMessage<
  GatewayMessageType.RequestValidate,
  {
    messageForSigning: BytesLike;
    txSkeleton: TransactionSkeletonType;
    hashContentExceptRawTx: BytesLike;
    hashAlgorithm: HashAlgorithm;
    signingType: SupportedSigningType;
  }
>;
export type GatewayInitMessage = GatewayInteractionMessage<
  GatewayMessageType.GatewayInit,
  {}
>;
export type ValidateSuccessMessage =
  GatewayInteractionMessage<GatewayMessageType.ValidateSuccess>;

export type ValidateFailedMessage =
  GatewayInteractionMessage<GatewayMessageType.ValidateFailed>;

export type RequestSignMessage = GatewayInteractionMessage<
  GatewayMessageType.RequestSign,
  {}
>;

export type SignSuccessMessage = GatewayInteractionMessage<
  GatewayMessageType.SignSuccess,
  { signedMessage: string }
>;
export type SignFailedMessage = GatewayInteractionMessage<
  GatewayMessageType.SignFailed,
  { reason: Error }
>;

type SupportedSigningType = "eth_personal_sign"; // TODO: support other wallet.
