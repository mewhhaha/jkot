import { Stream } from "@cloudflare/stream-react";
import type { LoaderFunction } from "@remix-run/react";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import type { CloudflareDataFunctionArgs, Video } from "~/types";

export const loader: LoaderFunction = async ({
  context,
  params,
}: CloudflareDataFunctionArgs): Promise<Video | undefined> => {
  const videos = await context.CACHE_KV.get<Video[]>("videos", "json");
  return videos?.find((video) => video.uid === params.id);
};

export default function Id() {
  const video = useLoaderData<Video | undefined>();
  const [searchParams] = useSearchParams();
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      {video && (
        <div key={video.uid} className="aspect-video h-full w-full">
          <Stream
            className="h-full w-full bg-black"
            controls
            startTime={searchParams.get("startTime") ?? undefined}
            title={video.meta.title}
            primaryColor="aquamarine"
            src={video.uid}
          />
        </div>
      )}
    </div>
  );
}
