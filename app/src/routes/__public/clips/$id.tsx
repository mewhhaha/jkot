import { Stream } from "@cloudflare/stream-react";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import type { CloudflareDataFunctionArgs, Video } from "~/types";

export const loader: LoaderFunction = async ({
  context,
  params: { id },
}: CloudflareDataFunctionArgs): Promise<Video | undefined> => {
  if (id === undefined) {
    throw new Error("Invariant violated");
  }

  const video = await context.VIDEO_KV.get<Video>(id, "json");
  if (video === null) {
    throw new Response("Video not found", { status: 404 });
  }

  return video;
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
