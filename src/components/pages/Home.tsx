import { randomAlphaNumeric } from "@/helpers/string";
import { useRouter } from "next/router";
import * as React from "react";
import { useCallback } from "react";

export const Home: React.FC = () => {
  const router = useRouter();

  const handleCreateNewRoom = useCallback(() => {
    router.push(`/rooms/${randomAlphaNumeric(10)}`);
  }, []);

  return (
    <main className="max-w-7xl mx-auto">
      <header className="text-center border rounded-lg p-8 m-5">
        <h1 className="text-xl">Watch the videos with your friends!</h1>
        <div className="text-center mt-5">
          <button
            className="rounded bg-green-600 text-white font-semibold p-2"
            onClick={handleCreateNewRoom}
          >
            Create new room
          </button>
        </div>
      </header>
    </main>
  );
};
