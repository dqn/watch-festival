import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Comment = {
  text: string;
  y: number;
  timestamp: number;
};

export function useNiconico(): [
  MutableRefObject<null | HTMLCanvasElement>,
  (text: string) => void,
] {
  const ref = useRef<null | HTMLCanvasElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const sendComment = useCallback(
    (text: string) => {
      const ctx = ref.current?.getContext("2d");

      if (!ref.current || !ctx) {
        return;
      }

      const { width, height } = ref.current;
      const fontSize = height / 16;

      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.strokeStyle = "#8c8c8c";
      ctx.lineWidth = fontSize / 13;
      ctx.fillStyle = "#fff";

      const textWidth = ctx.measureText(text).width;
      const x = calcCommentX(width, textWidth, 5000);

      const reservedY = new Set<number>();
      comments.forEach((comment) => {
        const nTextWidth = ctx.measureText(comment.text).width;
        const nx = calcCommentX(
          width,
          nTextWidth,
          Date.now() - comment.timestamp + 5000,
        );

        if (x < nx + nTextWidth || nx + nTextWidth > width) {
          reservedY.add(comment.y);
        }
      });

      let y = 0;
      [0, 1, 2, 3, 4, 5, 6, 7].some((i) => {
        if (!reservedY.has(i)) {
          y = i;
          return true;
        }
      });

      const comment = {
        text,
        y,
        timestamp: Date.now(),
      };

      setComments((comments) => [...comments, comment]);
    },
    [ref, comments, setComments],
  );

  const calcCommentX = useCallback(
    (width: number, textWidth: number, elapsed: number) => {
      return width - (width + textWidth) * (elapsed / 5000);
    },
    [],
  );

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");

    if (!ctx) {
      return;
    }

    const frame = () => {
      if (!ref.current) {
        return requestAnimationFrame(frame);
      }

      const { width, height } = ref.current;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#845";
      ctx.fillRect(0, 0, width, height);

      const nextComments: Comment[] = [];

      comments.forEach((comment) => {
        const fontSize = height / 16;
        const { width: textWidth } = ctx.measureText(comment.text);
        const x = calcCommentX(
          width,
          textWidth,
          Date.now() - comment.timestamp,
        );

        if (x + textWidth < 0) {
          return;
        }

        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.strokeStyle = "#8c8c8c";
        ctx.lineWidth = fontSize / 13;
        ctx.fillStyle = "#fff";
        ctx.strokeText(comment.text, x, comment.y * fontSize);
        ctx.fillText(comment.text, x, comment.y * fontSize);

        nextComments.push(comment);
      });

      return requestAnimationFrame(frame);
    };

    const handle = frame();

    return () => cancelAnimationFrame(handle);
  }, [ref, comments, setComments]);

  return [ref, sendComment];
}
