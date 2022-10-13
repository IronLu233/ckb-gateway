import { GatewayProviderIO } from "../shared";

interface WalletGatewayOpener {
  open(endpoint: string): GatewayProviderIO | null;
}

const browserGatewayAppOpener: WalletGatewayOpener = {
  open(endpoint: string) {
    return window.open(endpoint);
  },
};

export function getGatewayProviderIOOpener(): WalletGatewayOpener {
  // TODO: in future, we may invoke a browser extension as a gateway app.
  // if (typeof window !== 'undefined' && window.walletGateway) {
  //   return walletGatewayOpener;
  // }

  if (typeof window !== "undefined") {
    return browserGatewayAppOpener;
  }

  throw new Error("Current Javascript runtime is not supported");
}
