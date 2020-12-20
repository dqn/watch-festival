import type { Channel, Members } from "pusher-js";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Override } from "@/helpers/Override";
import { createPusherClient } from "@/helpers/pusher";

type ChannelMemberInfo = { name: string };
type ChannelMember = { id: string; info: ChannelMemberInfo };

type PusherEvents = {
  "pusher:subscription_succeeded": Override<
    Members,
    "members",
    { [key: string]: ChannelMemberInfo }
  >;
  "pusher:member_added": ChannelMember;
  "pusher:member_removed": ChannelMember;
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
  const [members, setMembers] = useState<ChannelMember[]>([]);
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

  const bindEvent = useCallback(
    <E extends keyof PusherEvents>(
      eventName: E,
      callback: (data: PusherEvents[E]) => void,
    ) => {
      channel?.bind(eventName, callback);
    },
    [channel],
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
    bindEvent(
      "pusher:subscription_succeeded",
      ({ members: initialMembers }) => {
        setMembers(
          Object.entries(initialMembers).map(([id, info]) => ({ id, info })),
        );

        bindEvent("client-video-url", ({ videoURL }) => {
          if (!video.current) {
            return;
          }
          video.current.src = videoURL;
        });

        bindEvent("client-seeked", ({ currentTime }) => {
          if (!video.current) {
            return;
          }
          setPreventTriggering(true);
          video.current.currentTime = currentTime;
        });

        bindEvent("client-playing-state", ({ playing }) => {
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
      },
    );
  }, [bindEvent]);

  useEffect(() => {
    bindEvent("pusher:member_removed", ({ id: removedId }) => {
      setMembers((members) => members.filter(({ id }) => id !== removedId));
    });

    bindEvent("pusher:member_added", ({ id, info }) => {
      setMembers((members) => [...members, { id, info }]);
    });
  }, [bindEvent, setMembers]);

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
      <article>
        <section>
          <label>Concurrent Viewers: {members.length}</label>
          <ul>
            {members.map(({ id, info }) => (
              <li key={id}>{info.name}</li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
};
