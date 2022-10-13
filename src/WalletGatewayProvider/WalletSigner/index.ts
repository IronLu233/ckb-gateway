import { SupportedSigningType } from "../../shared";
import { ETHPersonalSigner } from "./ETHPersonalSigner";

export type WalletSigner = {
  isAvailable: boolean;
  sign(digest: string): Promise<string>;
};

export function getWalletSigner(
  signingMethod: SupportedSigningType
): WalletSigner {
  if (typeof window !== "undefined") {
    switch (signingMethod) {
      case "eth_personal_sign":
        return ETHPersonalSigner;
    }
  }

  throw new Error("This signing method is not supported");
}
