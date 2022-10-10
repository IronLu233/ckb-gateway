export type WalletSigningMethod = (
  messageForSigning: string
) => Promise<string>;
export { ETHPersonalSign } from "./ETHPersonalSign";
