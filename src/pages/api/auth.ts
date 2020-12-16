import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

function randomAlphaNumeric(length: number): string {
  let s = "";
  Array.from({ length }).some(() => {
    s += Math.random().toString(36).slice(2);
    return s.length >= length;
  });
  return s.slice(0, length);
}

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { socket_id: socketId, channel_name: channel } = req.body;

  const id = randomAlphaNumeric(15);

  const auth = pusher.authenticate(socketId, channel, {
    user_id: id,
    user_info: {
      name: id,
    },
  });

  res.send(auth);
};

export default handler;
