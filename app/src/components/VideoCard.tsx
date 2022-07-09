import { Stream } from "@cloudflare/stream-react";
import type { PublishedClip } from "~/types";

type VideoCardProps = PublishedClip & {
  children?: React.ReactNode;
};

export const VideoCard: React.FC<VideoCardProps> = ({
  title,
  video,
  description,
  children,
}) => {
  const minutes = Math.floor((video.duration / 60) % 60);
  const hours = Math.floor(video.duration / 3600);

  return (
    <article className="relative flex w-full flex-col overflow-hidden rounded-lg shadow-lg">
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
          <p className="text-xl font-semibold text-gray-900">{title}</p>
          <p className="mt-3 text-base text-gray-500">{description}</p>
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
      {children}
    </article>
  );
};
