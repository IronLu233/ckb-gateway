import { GatewayIO } from "./shared";

const browserGatewayClientIO: GatewayIO | null =
  typeof window !== "undefined" ? window : null;

export function getSelfProcessIO(): GatewayIO {
  if (typeof window !== "undefined") {
    return browserGatewayClientIO!;
  }

  throw new Error("Current Javascript runtime is not supported");
}
