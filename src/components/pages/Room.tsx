import type { Channel, Members } from "pusher-js";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import type { Override } from "@/helpers/Override";
import { createPusherClient } from "@/helpers/pusher";

import type { Comment } from "../organisms/CommentViewer";
import { CommentViewer } from "../organisms/CommentViewer";

type ChannelMemberInfo = { name: string };
type ChannelMember = { id: string; info: ChannelMemberInfo };

type PusherEvents = {
  "pusher:subscription_succeeded": Override<
    Members,
    "members",
    { [id: string]: ChannelMemberInfo }
  >;
  "pusher:member_added": ChannelMember;
  "pusher:member_removed": ChannelMember;
  "client-playing-states": {
    url: string;
    paused: boolean;
    currentTime: number;
  };
  "client-comment": Comment;
};

export type Props = {
  id: string;
  name: string;
};

export const Room: React.FC<Props> = ({ id, name }) => {
  const video = useRef<HTMLVideoElement>(null);

  const [channel, setChannel] = useState<null | Channel>(null);
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [preventTriggering, setPreventTriggering] = useState(false);
  const { register, handleSubmit } = useForm<{ url: string }>();

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
    handleSubmit(({ url }) => {
      if (!video.current) {
        return;
      }

      video.current.src = url;
      sharePlayingStates();
    }),
    [video, sharePlayingStates],
  );

  const handleComment = useCallback(
    (text: string) => {
      const comment = { name, text };
      setComments((comments) => [...comments, comment]);
      triggerEvent("client-comment", comment);
    },
    [triggerEvent],
  );

  useEffect(() => {
    const pusher = createPusherClient();
    const channelName = `presence-room-${id}`;
    const channel = pusher.subscribe(channelName);
    setChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, []);

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

    bindEvent("client-comment", (comment) => {
      setComments((comments) => [...comments, comment]);
    });
  }, [channel]);

  if (!channel) {
    return null;
  }

  return (
    <main className="max-w-10xl mx-auto">
      <div className="flex flex-wrap lg:mt-8">
        <div className="w-full lg:w-3/4">
          <video
            ref={video}
            controls
            onSeeked={sharePlayingStates}
            onPlay={sharePlayingStates}
            onPause={sharePlayingStates}
            muted
            className="w-full"
          />
          <div className="py-2 lg:py-0">
            <form className="flex" onSubmit={handleVideoURLSubmit}>
              <label className="flex-shrink-0">Video URL:</label>
              <input ref={register} name="url" className="border w-full ml-2" />
            </form>
          </div>
        </div>

        <div className="w-full lg:w-1/4 lg:pl-4">
          <CommentViewer comments={comments} onComment={handleComment} />
        </div>
      </div>
    </main>
  );
};
