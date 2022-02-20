import { Stream } from "@cloudflare/stream-react";
import { LoaderFunction, useLoaderData } from "remix";
import { svc } from "~/services/settings.server";
import { CloudflareDataFunctionArgs } from "~/types";

export const loader: LoaderFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs) => {
  const settings = svc(request, context, "stream");
  const response = await settings.get();

  return await response.json();
};

export default function Index() {
  const stream = useLoaderData();

  return (
    <div className="flex-grow">
      <div className="relative z-0 flex h-full w-full flex-col items-center px-0 pt-0 sm:px-12 sm:pt-12">
        <div className="h-full max-h-[512px] w-full max-w-[960px] bg-black p-2 shadow-md sm:rounded">
          <Stream
            className="aspect-video h-full w-full bg-black"
            controls
            loop
            title={stream.title}
            muted
            autoplay
            primaryColor="aquamarine"
            src={stream.id}
          />
        </div>
        <dl className="z-10 w-full max-w-[1920px] pt-2 pl-2 text-white sm:pl-0">
          <dt className="sr-only">Stream Title</dt>
          <dd className="text-lg font-semibold">{stream.title}</dd>
          <dt className="sr-only">Category</dt>
          <dd>{stream.category}</dd>
        </dl>
      </div>
    </div>
  );
}
