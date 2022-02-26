import { Stream } from "@cloudflare/stream-react";
import { LoaderFunction, useLoaderData } from "remix";
import { ArticleBlurb, ArticleCard } from "~/components/ArticleCard";
import { blurbs } from "~/services/article.server";
import { categories } from "~/services/category.client";
import * as settings from "~/services/settings.server";
import { CloudflareDataFunctionArgs, StreamSettings } from "~/types";

export const loader: LoaderFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs) => {
  const { stream = {} } = await settings.all(request, context).json();

  return { stream, blurbs };
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
  const { stream, blurbs } =
    useLoaderData<{ stream: StreamSettings; blurbs: ArticleBlurb[] }>();

  return (
    <div className="flex-grow space-y-20">
      <section className="relative flex flex-col items-center sm:px-12 sm:pt-12">
        <div className="h-full max-h-[800px] w-full max-w-[960px] rounded-lg bg-white p-10 shadow-lg">
          <div className="h-full max-h-[512px] w-full max-w-[960px] bg-black">
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
      </section>
      <section className="relative">
        <div className="bg-gradient-to-r from-pink-500 to-orange-700 pb-16 lg:relative lg:z-10 lg:pb-0">
          <div className="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-8 lg:px-8">
            <div className="relative lg:-my-8">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1/2 bg-white lg:hidden"
              />
              <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:h-full lg:p-0">
                <div className="aspect-w-10 aspect-h-6 sm:aspect-w-16 sm:aspect-h-7 lg:aspect-none overflow-hidden rounded-xl shadow-xl lg:h-full">
                  <img
                    className="relative z-10 object-cover lg:h-full lg:w-full"
                    src="https://images.unsplash.com/photo-1520333789090-1afc82db536a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2102&q=80"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className="mt-12 lg:col-span-2 lg:m-0 lg:pl-8">
              <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0 lg:py-20">
                <blockquote>
                  <div>
                    <svg
                      className="h-12 w-12 text-white opacity-25"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="mt-6 text-2xl font-medium text-white">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed urna nulla vitae laoreet augue. Amet feugiat est
                      integer dolor auctor adipiscing nunc urna, sit.
                    </p>
                  </div>
                  <footer className="mt-6">
                    <p className="text-base font-medium text-white">
                      Judith Black
                    </p>
                    <p className="text-base font-medium text-cyan-100">
                      CEO at PureInsights
                    </p>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative bg-gray-50 px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0">
          <div className="h-1/3 bg-white sm:h-2/3" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              From the blog
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsa
              libero labore natus atque, ducimus sed.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-lg gap-5 lg:max-w-none lg:grid-cols-3">
            {blurbs.map((blurb) => (
              <ArticleCard key={blurb.title} {...blurb} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
