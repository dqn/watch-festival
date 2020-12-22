import { useRouter } from "next/router";
import * as React from "react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useCookies } from "react-cookie";

type Props = {
  callback?: string;
};

export const Profile: React.FC<Props> = ({ callback }) => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<{ name: string }>();
  const [cookies, setCookie] = useCookies(["name"]);

  const handleNameSubmit = useCallback(
    handleSubmit(({ name }) => {
      setCookie("name", name, { path: "/" });
      router.push(callback ?? "/");
    }),
    [router],
  );

  return (
    <main className="max-w-xs mx-auto">
      <form onSubmit={handleNameSubmit}>
        <section className="flex mt-6">
          <label className="flex-shrink">Name</label>
          <input
            ref={register({ required: true, maxLength: 20 })}
            name="name"
            defaultValue={cookies.name}
            className="border flex-grow ml-2"
          />
        </section>

        <section className="mt-4">
          <button className="bg-green-600 text-white rounded font-semibold w-full p-2">
            Update
          </button>
        </section>
      </form>
    </main>
  );
};
