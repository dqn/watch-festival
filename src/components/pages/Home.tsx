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
  "client-playing-states": {
    url: string;
    paused: boolean;
    currentTime: number;
  };
};

export const Home: React.FC = () => {
  const video = useRef<HTMLVideoElement>(null);

  const [channel, setChannel] = useState<null | Channel>(null);
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [preventTriggering, setPreventTriggering] = useState(false);
  const { register, handleSubmit } = useForm<{ videoURL: string }>();

  const triggerEvent = useCallback(
    <E extends keyof PusherEvents>(eventName: E, data: PusherEvents[E]) => {
      if (!preventTriggering) {
        channel?.trigger(eventName, data);
      }
    },
    [preventTriggering, channel],
  );

  const sharePlayingStates = useCallback(() => {
    if (video.current) {
      const { src, paused, currentTime } = video.current;
      triggerEvent("client-playing-states", { url: src, paused, currentTime });
    }
  }, [triggerEvent, video]);

  const handleVideoURLSubmit = useCallback(
    handleSubmit(({ videoURL }) => {
      if (!video.current) {
        return;
      }

      video.current.src = videoURL;
      sharePlayingStates();
    }),
    [video, sharePlayingStates],
  );

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
    video.current?.addEventListener("loadeddata", () => {
      video.current?.play();
    });
  }, [video]);

  useEffect(() => {
    const bindEvent = <E extends keyof PusherEvents>(
      eventName: E,
      callback: (data: PusherEvents[E]) => void,
    ) => {
      channel?.bind(eventName, callback);
    };

    bindEvent("pusher:subscription_succeeded", ({ members }) => {
      setMembers(Object.entries(members).map(([id, info]) => ({ id, info })));

      bindEvent("client-playing-states", ({ url, paused, currentTime }) => {
        if (!video.current) {
          return;
        }

        setPreventTriggering(true);

        const tasks: string[] = [];

        if (video.current.currentTime !== currentTime) {
          video.current.currentTime = currentTime;
          tasks.push("seeked");
        }

        if (video.current.src !== url) {
          video.current.src = url;
          tasks.push("loadeddata");
        }

        if (paused && !video.current.paused) {
          tasks.push("pause");
          video.current.pause();
        } else if (!paused && video.current.paused) {
          tasks.push("play");
          video.current.play();
        }

        const pendings = tasks.map(
          (event) =>
            new Promise((resolve) =>
              video.current?.addEventListener(event, resolve),
            ),
        );

        Promise.all(pendings).then(() => {
          setPreventTriggering(false);
        });
      });
    });

    bindEvent("pusher:member_added", (member) => {
      setMembers((members) => [...members, member]);
      sharePlayingStates();
    });

    bindEvent("pusher:member_removed", ({ id: removedId }) => {
      setMembers((members) => members.filter(({ id }) => id !== removedId));
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
        onSeeked={sharePlayingStates}
        onPlay={sharePlayingStates}
        onPause={sharePlayingStates}
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
