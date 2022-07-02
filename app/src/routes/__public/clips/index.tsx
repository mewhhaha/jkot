import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import type { CloudflareDataFunctionArgs, Video } from "~/types";
import { exists } from "~/utils/filter";

type LoaderData = {
  videos: Video[];
};

export const loader: LoaderFunction = async ({
  context,
}: CloudflareDataFunctionArgs): Promise<LoaderData> => {
  const list = await context.VIDEO_KV.list({ prefix: "date" });

  const result = await Promise.all(
    list.keys.map(({ name }) => context.VIDEO_KV.get<Video>(name, "json"))
  );

  const videos = result.filter(exists);

  return { videos };
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
