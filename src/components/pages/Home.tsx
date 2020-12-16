import * as React from "react";
import { useEffect, useState } from "react";
import { Channel } from "pusher-js";

import { pusher } from "@/helpers/pusher";

export const Home: React.FC = () => {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const channel = pusher.subscribe("presence-channel");

    channel.bind("pusher:subscription_succeeded", () => {
      channel.bind("client-click", (data: any) => {
        console.log(data);
      });
    });

    setChannel(channel);
  }, []);

  if (!channel) {
    return null;
  }

  return (
    <main className="max-w-7xl p-3 mx-auto">
      <h1>Hello!</h1>
      <button onClick={() => channel.trigger("client-click", "test")}>
        click
      </button>
    </main>
  );
};
