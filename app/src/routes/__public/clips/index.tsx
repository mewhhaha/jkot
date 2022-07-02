import { Stream } from "@cloudflare/stream-react";
import { TrashIcon } from "@heroicons/react/outline";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import { Button } from "~/components/Button";
import type { CloudflareDataFunctionArgs, PublishedVideo } from "~/types";
import { exists } from "~/utils/filter";

type LoaderData = {
  videos: PublishedVideo[];
};

export const loader: LoaderFunction = async ({
  context,
}: CloudflareDataFunctionArgs): Promise<LoaderData> => {
  const list = await context.VIDEO_KV.list({ prefix: "date" });

  const result = await Promise.all(
    list.keys.map(({ name }) =>
      context.VIDEO_KV.get<PublishedVideo>(name, "json")
    )
  );

  const videos = result.filter(exists);

  return { videos };
};

export default function Clips() {
  const { videos } = useLoaderData<LoaderData>();

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
                        <p className="text-xl font-semibold text-gray-900">
                          {title}
                        </p>
                        <p className="mt-3 text-base text-gray-500">
                          {description}
                        </p>
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
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
