import type { WalletSigningMethod } from "./index";
interface EthereumRPC {
  (payload: {
    method: "personal_sign";
    params: [string /*from*/, string /*message*/];
  }): Promise<string>;
}

type EthereumProvider = {
  enable: () => Promise<string[]>;
  request: EthereumRPC;
  selectedAddress: string;
};

const ethereum = (window as any).ethereum as EthereumProvider;

export const ETHPersonalSign: WalletSigningMethod = async (
  messageForSigning
) => {
  await ethereum.enable();
  const signature = await ethereum.request({
    method: "personal_sign",
    params: [ethereum.selectedAddress, messageForSigning],
  });
  return signature;
};
