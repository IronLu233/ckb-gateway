import { GatewayIO } from "../shared";

export function getGatewayClientIO(): GatewayIO {
  // TODO
  // in future, also have from wallet gateway browser extension
  if (typeof window !== "undefined") {
    if (!window.opener) {
      if (process.env.NODE_ENV !== "development") {
        throw new Error("No gateway opener window found");
      } else {
        console.error(
          "No gateway opener window found, in production this will throw an error"
        );
      }
    }
    return window.opener;
  }

  throw new Error("Current Javascript runtime is not supported");
}
