import { Stream } from "@cloudflare/stream-react";
import { TrashIcon } from "@heroicons/react/outline";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import type { CloudflareDataFunctionArgs } from "~/types";

type Video = {
  allowedOrigins: string[];
  created: string;
  duration: number;
  input: {
    height: number;
    width: number;
  };
  maxDurationSeconds: number;
  meta: Record<string, string>;
  modified: string;
  uploadExpiry: string;
  playback: {
    hls: string;
    dash: string;
  };
  preview: string;
  readyToStream: true;
  requireSignedURLs: true;
  size: number;
  status: {
    state: string;
    pctComplete: number;
    errorReasonCode: string;
    errorReasonText: string;
  };
  thumbnail: string;
  thumbnailTimestampPct: number;
  uid: string;
  liveInput: string;
  uploaded: string;
  watermark: {
    uid: string;
    size: number;
    height: number;
    width: number;
    created: string;
    downloadedFrom: string;
    name: string;
    opacity: number;
    padding: number;
    scale: number;
    position: string;
  };
  nft: {
    contract: string;
    token: number;
  };
};

type LoaderData = {
  videos: Video[];
};

export const loader: LoaderFunction = async ({
  context,
}: CloudflareDataFunctionArgs): Promise<LoaderData> => {
  const videos = await context.CACHE_KV.get<Video[]>("videos", "json");

  return { videos: videos ?? [] };
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
            {videos.map((video) => {
              return (
                <li key={video.uid}>
                  <article className="relative flex flex-col overflow-hidden rounded-lg shadow-lg">
                    <div className="flex-shrink-0">
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
                          Title
                        </p>
                        <p className="mt-3 text-base text-gray-500">
                          Description
                        </p>
                      </div>
                      <div className="mt-6 flex items-center">
                        <div className="flex-shrink-0">
                          <Avatar
                            href="AuthroWebsite"
                            image="AuthorAvatarImage"
                            user="Authro"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            <a href="AuthorWebsite" className="hover:underline">
                              Author
                            </a>
                          </p>
                          <div className="flex space-x-1 text-sm text-gray-500">
                            <time dateTime={video.created}>
                              {new Date(video.created).toDateString()}
                            </time>
                            <span aria-hidden="true">&middot;</span>
                            <span>{video.duration / 60} min watch</span>
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
