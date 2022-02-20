import { Stream } from "@cloudflare/stream-react";
import { LoaderFunction, useLoaderData } from "remix";
import { categories } from "~/services/category.client";
import * as settings from "~/services/settings.server";
import { CloudflareDataFunctionArgs, StreamSettings } from "~/types";

export const loader: LoaderFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs) => {
  const { stream = {} } = await settings.all(request, context).json();

  return stream;
};

const getCategoryURL = (category: string | undefined) => {
  switch (category) {
    case "DOTA2":
    case "Humankind":
      return categories[category];
  }

  return undefined;
};

export default function Index() {
  const stream = useLoaderData<StreamSettings>();

  return (
    <div className="flex-grow">
      <div className="relative flex h-full w-full flex-col items-center px-0 pt-0 sm:px-12 sm:pt-12">
        <div className="h-full max-h-[512px] w-full max-w-[960px] bg-black p-2 shadow-md sm:rounded">
          <Stream
            className="aspect-video h-full w-full bg-black"
            controls
            loop
            title={stream.title}
            muted
            autoplay
            primaryColor="aquamarine"
            src={stream.id ?? ""}
          />
        </div>
        <dl className="w-full max-w-[960px] pt-2 pl-2 text-orange-600 sm:pl-0">
          <dt className="sr-only">Stream Title</dt>
          <dd className="text-lg font-semibold">{stream.title}</dd>
          <dt className="sr-only">Category</dt>
          <dd>
            <a
              href={getCategoryURL(stream.category)}
              className="text-blue-800 underline-offset-2 hover:underline"
            >
              {stream.category}
            </a>
          </dd>
        </dl>
      </div>
    </div>
  );
}
