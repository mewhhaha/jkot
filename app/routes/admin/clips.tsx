import { Stream } from "@cloudflare/stream-react";
import { LoaderFunction, useLoaderData } from "remix";
import { CloudflareDataFunctionArgs } from "~/types";

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
    <div className="w-full h-full grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
      {videos.map((video) => {
        return (
          <div key={video.uid} className="aspect-video">
            <Stream
              className="h-full w-full bg-black"
              controls
              title={video.meta.title}
              primaryColor="aquamarine"
              src={video.uid}
            />
          </div>
        );
      })}
    </div>
  );
}
