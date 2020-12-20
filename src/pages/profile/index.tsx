import { NextPage } from "next";
import { useRouter } from "next/router";

import { Profile } from "@/components/pages/Profile";

const ProfilePage: NextPage = () => {
  const router = useRouter();
  const { callback } = router.query;

  if (Array.isArray(callback)) {
    throw TypeError(`callback url must be string (got ${callback})`);
  }

  return (
    <>
      <Profile callback={callback} />
    </>
  );
};

export default ProfilePage;
