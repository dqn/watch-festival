import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

export type Comment = {
  name: string;
  text: string;
};

type Props = {
  onComment(text: string): void;
  comments: Comment[];
};

export const CommentViewer: React.FC<Props> = ({ comments, onComment }) => {
  const { register, handleSubmit, reset } = useForm<{ text: string }>();

  const handleCommentSubmit = useCallback(
    handleSubmit(({ text }) => {
      reset();
      onComment(text);
    }),
    [onComment],
  );

  const listRef = useRef<HTMLUListElement>(null);

  const scrollToBottomOfList = useCallback(() => {
    listRef.current?.scrollTo({
      behavior: "smooth",
      top: listRef.current.scrollHeight,
    });
  }, [listRef]);

  useEffect(() => {
    scrollToBottomOfList();
  }, [comments]);

  return (
    <div className="flex flex-col h-full">
      <div className="relative border flex-grow h-80">
        <ul
          ref={listRef}
          className="absolute overflow-y-auto w-full h-full p-2"
        >
          {comments.map(({ name, text }, i) => (
            <li className="my-2" key={i}>
              <span className="font-semibold">{name}</span>
              <span className="break-all text-gray-600 text-sm ml-2">
                {text}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="border border-t-0">
        <form onSubmit={handleCommentSubmit}>
          <input
            ref={register({ required: true })}
            name="text"
            placeholder="Send message..."
            className="w-full p-2"
          />
        </form>
      </div>
    </div>
  );
};
