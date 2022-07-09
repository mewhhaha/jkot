import { TrashIcon } from "@heroicons/react/outline";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/Button";
import { CardList } from "~/components/CardList";
import { VideoCard } from "~/components/VideoCard";
import { requireAuthentication } from "~/services/auth.server";
import type { PublishedClip } from "~/types";
import { exists } from "~/utils/filter";

type LoaderData = {
  clips: PublishedClip[];
};

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ context }): Promise<LoaderData> => {
    const list = await context.VIDEO_KV.list({ prefix: "date" });

    const result = await Promise.all(
      list.keys.map(({ name }) =>
        context.VIDEO_KV.get<PublishedClip>(name, "json")
      )
    );

    const clips = result.filter(exists);

    return { clips };
  });

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
            <li key={clip.video.uid}>
              <VideoCard {...clip}>
                <div className="absolute top-2 right-2">
                  <Link prefetch="intent" to={`${clip.video.uid}/delete`}>
                    <Button type="submit">
                      <TrashIcon className="-mx-1 h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Delete Video</span>
                    </Button>
                  </Link>
                </div>
              </VideoCard>
            </li>
          );
        })}
      </CardList>
      <Outlet />
    </div>
  );
}
