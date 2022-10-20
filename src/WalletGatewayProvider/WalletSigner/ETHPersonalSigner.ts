import type { WalletSigner } from "./index";

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

export const ETHPersonalSigner: WalletSigner = {
  get isAvailable() {
    return !!(typeof window !== "undefined" && (window as any).ethereum);
  },
  async sign(digest) {
    await ethereum.enable();
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [ethereum.selectedAddress, digest],
    });
    return signature;
  },
};
