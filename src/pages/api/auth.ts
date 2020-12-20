import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import Pusher from "pusher";

import { randomAlphaNumeric } from "@/helpers/string";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { socket_id: socketId, channel_name: channel } = req.body;
  const { name } = req.cookies;

  const id = randomAlphaNumeric(15);

  const auth = pusher.authenticate(socketId, channel, {
    user_id: id,
    user_info: {
      name,
    },
  });

  res.send(auth);
};

export default handler;
