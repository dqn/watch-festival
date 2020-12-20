import { Channel } from "pusher-js";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { createPusherClient } from "@/helpers/pusher";

type PusherEvents = {
  "client-video-url": {
    videoURL: string;
  };
  "client-seeked": {
    currentTime: number;
  };
  "client-playing-state": {
    playing: boolean;
  };
};

export const Home: React.FC = () => {
  const video = useRef<HTMLVideoElement>(null);

  const [channel, setChannel] = useState<Channel | null>(null);
  const [preventTriggering, setPreventTriggering] = useState(false);
  const { register, handleSubmit } = useForm<{ videoURL: string }>();

  const triggerEvent = useCallback(
    <E extends keyof PusherEvents>(eventName: E, data: PusherEvents[E]) => {
      if (!preventTriggering) {
        channel?.trigger(eventName, data);
      }
      setPreventTriggering(false);
    },
    [preventTriggering, channel],
  );

  const handleVideoURLSubmit = useCallback(
    handleSubmit(({ videoURL }) => {
      if (!video.current) {
        return;
      }

      video.current.src = videoURL;
      triggerEvent("client-video-url", { videoURL });
    }),
    [triggerEvent, video],
  );

  const handleSeeked = useCallback(() => {
    triggerEvent("client-seeked", {
      currentTime: video.current?.currentTime!,
    });
  }, [triggerEvent, video]);

  const handlePlay = useCallback(() => {
    triggerEvent("client-playing-state", {
      playing: true,
    });
  }, [triggerEvent]);

  const handlePause = useCallback(() => {
    triggerEvent("client-playing-state", {
      playing: false,
    });
  }, [triggerEvent]);

  useEffect(() => {
    const pusher = createPusherClient();
    const channelName = "presence-channel";
    const channel = pusher.subscribe(channelName);
    setChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!channel) {
      return;
    }

    channel.bind("pusher:subscription_succeeded", () => {
      const bind = <E extends keyof PusherEvents>(
        eventName: E,
        callback: (data: PusherEvents[E]) => void,
      ) => {
        channel.bind(eventName, callback);
      };

      bind("client-video-url", ({ videoURL }) => {
        if (!video.current) {
          return;
        }
        video.current.src = videoURL;
      });

      bind("client-seeked", ({ currentTime }) => {
        if (!video.current) {
          return;
        }
        setPreventTriggering(true);
        video.current.currentTime = currentTime;
      });

      bind("client-playing-state", ({ playing }) => {
        if (!video.current) {
          return;
        }
        setPreventTriggering(true);
        if (playing) {
          video.current.play();
        } else {
          video.current.pause();
        }
      });
    });
  }, [channel]);

  if (!channel) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto">
      <video
        ref={video}
        controls
        onSeeked={handleSeeked}
        onPlay={handlePlay}
        onPause={handlePause}
        muted
        className="w-full"
      />
      <form className="flex mt-2" onSubmit={handleVideoURLSubmit}>
        <label className="flex-shrink-0">Video URL:</label>
        <input ref={register} name="videoURL" className="border w-full ml-2" />
      </form>
    </main>
  );
};
