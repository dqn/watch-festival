import Pusher from "pusher-js";

Pusher.logToConsole = process.env.NODE_ENV !== "production";

export function createPusherClient() {
  return new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    authEndpoint: "/api/auth",
  });
}
