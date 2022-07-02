import { Stream } from "@cloudflare/stream-react";
import { TrashIcon } from "@heroicons/react/outline";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { Form, Link, Outlet, useLoaderData, useSubmit } from "@remix-run/react";
import { Button } from "~/components/Button";
import { requireAuthentication } from "~/services/auth.server";
import { fields } from "~/services/form.server";
import { item } from "~/services/settings.server";
import type { PublishedVideo } from "~/types";
import { exists } from "~/utils/filter";

type LoaderData = {
  videos: PublishedVideo[];
};

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ context }): Promise<LoaderData> => {
    const list = await context.VIDEO_KV.list({ prefix: "date" });

    const result = await Promise.all(
      list.keys.map(({ name }) =>
        context.VIDEO_KV.get<PublishedVideo>(name, "json")
      )
    );

    const videos = result.filter(exists);

    return { videos };
  });

export const action: ActionFunction = (args) =>
  requireAuthentication(args, async ({ context, request }) => {
    const formData = await request.formData();
    const form = fields(formData, ["title", "description", "id"]);

    const settings = item(request, context, `video/${form.id}`);
    return settings.put({
      ...settings,
      title: form.title,
      description: form.description,
    });
  });

export default function Clips() {
  const { videos } = useLoaderData<LoaderData>();
  const submit = useSubmit();

  return (
    <div className="flex flex-grow justify-center">
      <section className="relative w-full bg-gray-50 px-4 pt-16 pb-20 sm:px-6">
        <div className="absolute inset-0">
          <div className="h-1/3 bg-white sm:h-2/3" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              From the stream
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
              These are my clips. It's all terrible. No need to guess.
            </p>
          </div>
          <ul className="mx-auto mt-12 grid max-w-lg gap-5">
            {videos.map(({ video, title, description }) => {
              const minutes = Math.floor((video.duration / 60) % 60);
              const hours = Math.floor(video.duration / 3600);

              return (
                <li key={video.uid}>
                  <article className="relative flex flex-col overflow-hidden rounded-lg shadow-lg">
                    <div className="flex aspect-video h-full w-full flex-shrink-0">
                      <Stream
                        className="h-full w-full bg-black"
                        controls
                        title={video.meta.title}
                        primaryColor="aquamarine"
                        src={video.uid}
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between bg-white p-6">
                      <div className="flex-1">
                        <Form
                          method="post"
                          onBlur={(event) => submit(event.currentTarget)}
                        >
                          <input hidden value={video.uid} name="id" />
                          <input
                            className="border-b-2 border-gray-900 text-xl font-semibold text-gray-900 focus:border-orange-600 focus:text-orange-600 focus:outline-none"
                            name="title"
                            value={title}
                          />
                          <input
                            className="mt-3 border-b-2 border-gray-900 text-base font-semibold text-gray-500 focus:border-orange-600 focus:text-orange-600 focus:outline-none"
                            name="description"
                            value={description}
                          />
                        </Form>
                      </div>
                      <div className="mt-6 flex items-center">
                        <div className="ml-3">
                          <div className="flex space-x-1 text-sm text-gray-500">
                            <time dateTime={video.created}>
                              {new Date(video.created).toDateString()}
                            </time>
                            <span aria-hidden="true">&middot;</span>
                            <span>
                              {hours > 0 ? `${hours} h` : ""}{" "}
                              {minutes > 0 ? `${minutes} min` : ""} watch
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Link to={`${video.uid}/delete`}>
                        <Button type="submit">
                          <TrashIcon
                            className="-mx-1 h-5 w-5"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Delete Video</span>
                        </Button>
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <Outlet />
    </div>
  );
}
