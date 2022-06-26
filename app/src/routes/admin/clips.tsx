import { Stream } from "@cloudflare/stream-react";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
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
    <ul className="flex w-full flex-col items-center space-y-10">
      {videos.map((video) => {
        return (
          <li
            key={video.uid}
            className="flex w-full max-w-md flex-col rounded-md border"
          >
            <label className="text-lg font-semibold">
              This is a video description
            </label>
            <div className="aspect-video">
              <Stream
                className="h-full w-full bg-black"
                controls
                title={video.meta.title}
                primaryColor="aquamarine"
                src={video.uid}
              />
            </div>
            <div className="pt-12">
              <Link to={`${video.uid}/delete`} type="post">
                <Button type="submit" danger>
                  Delete
                </Button>
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
