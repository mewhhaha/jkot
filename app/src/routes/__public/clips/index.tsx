import type { LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { CardList } from "~/components/CardList";
import { VideoCard } from "~/components/VideoCard";
import type { CloudflareDataFunctionArgs, PublishedClip } from "~/types";
import { exists } from "~/utils/filter";

type LoaderData = {
  clips: PublishedClip[];
};

export const loader: LoaderFunction = async ({
  context,
}: CloudflareDataFunctionArgs): Promise<LoaderData> => {
  const list = await context.VIDEO_KV.list({ prefix: "date" });

  const result = await Promise.all(
    list.keys.map(({ name }) =>
      context.VIDEO_KV.get<PublishedClip>(name, "json")
    )
  );

  const clips = result.filter(exists);

  return { clips };
};

export default function Clips() {
  const { clips } = useLoaderData<LoaderData>();

  return (
    <div className="flex flex-grow justify-center">
      <CardList
        title="From the stream"
        description="These are my clips. It's all terrible. No need to guess."
      >
        {clips.map((clip) => {
          return (
            <li key={clip.video.uid} className="flex h-full w-full">
              <VideoCard {...clip} />
            </li>
          );
        })}
      </CardList>
    </div>
  );
}
