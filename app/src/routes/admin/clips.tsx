import { PencilIcon, TrashIcon } from "@heroicons/react/outline";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/Button";
import { CardList } from "~/components/CardList";
import { VideoCard } from "~/components/VideoCard";
import { requireAuthentication } from "~/services/auth.server";
import { all } from "~/services/settings.server";
import type { PublishedClip, Video } from "~/types";
import { exists } from "~/utils/filter";

type LoaderData = {
  clips: PublishedClip[];
  extra: any;
};

export const loader: LoaderFunction = (args) =>
  requireAuthentication(
    args,
    async ({ request, context }): Promise<LoaderData> => {
      const settings = all(request, context, "video").json();
      const all = all(request, context).json();

      const clips = await Promise.all(
        Object.values(settings)
          .filter(exists)
          .map(async ({ title, description, id }) => {
            const url = new URL(
              `https://api.cloudflare.com/client/v4/accounts/${context.ACCOUNT_ID}/stream/${id}`
            );

            const response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${context.STREAM_ACCESS_TOKEN}`,
              },
            });

            const video = await response.json<{ result: Video }>();

            return {
              title,
              description,
              video: video.result,
              extra: JSON.stringify(video),
            };
          })
      );

      return { clips, extra: all };
    }
  );

export default function Clips() {
  const { clips, extra } = useLoaderData<LoaderData>();
  console.log(clips, extra);

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
                  <Link prefetch="intent" to={`${clip.video.uid}/edit`}>
                    <Button type="button">
                      <PencilIcon
                        className="-mx-1 h-5 w-5"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Edit Video</span>
                    </Button>
                  </Link>
                  <Link prefetch="intent" to={`${clip.video.uid}/delete`}>
                    <Button type="button">
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
