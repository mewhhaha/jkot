import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import type { CloudflareDataFunctionArgs, Video } from "~/types";

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
    <div className="grid h-full w-full grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => {
        return (
          <div key={video.uid} className="aspect-video">
            <Link to={`/clips/${video.uid}`}>
              <img
                className="h-full w-full bg-black"
                src={video.thumbnail}
                alt="Thumbnail"
              />
              <label>{video.meta.title}</label>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
