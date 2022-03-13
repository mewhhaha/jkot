import { Stream } from "@cloudflare/stream-react";
import { AcademicCapIcon } from "@heroicons/react/outline";
import { Link, LoaderFunction, useLoaderData } from "remix";
import { ArticleCard } from "~/components/ArticleCard";
import { categories } from "~/services/category";
import * as settings from "~/services/settings.server";
import {
  CloudflareDataFunctionArgs,
  PublishedContent,
  StreamSettings,
} from "~/types";
import { readingTime } from "~/utils/text";

type LoaderData = { stream: StreamSettings; articles: PublishedContent[] };

export const loader: LoaderFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs): Promise<LoaderData> => {
  const { stream = {} } = await settings.all(request, context).json();

  const latestArticles = await context.ARTICLE_KV.list({
    prefix: "date#",
    limit: 4,
  });

  const contents = await Promise.all(
    latestArticles.keys.map(({ name }) =>
      context.ARTICLE_KV.get<PublishedContent>(name, {
        type: "json",
      })
    )
  );

  return {
    stream,
    articles: contents.filter(
      (content): content is PublishedContent => content !== null
    ),
  };
};

const getCategoryURL = (category: string | undefined) => {
  switch (category) {
    case "DOTA2":
    case "Elden Ring":
    case "Humankind":
      return categories[category];
  }

  return undefined;
};

const placeholder: PublishedContent = {
  title: "Not yet",
  category: "",
  description: "This article is yet to be created!",
  created: new Date(0).toISOString(),
  modified: new Date(0).toISOString(),
  author: "Nobody",
  authorWebsite: "/",
  authorImage: "",
  slug: "",
  published: new Date(0).toISOString(),
  imageUrl:
    "https://images.unsplash.com/photo-1520333789090-1afc82db536a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2102&q=80",
  imageAlt: "",
  imageAuthor: "",
  body: "",
};

export default function Index() {
  const { stream, articles } = useLoaderData<LoaderData>();

  const featured = articles[0] ?? placeholder;

  return (
    <div className="flex-grow space-y-20">
      <section className="relative flex flex-col items-center sm:px-12 sm:pt-12">
        <div className="h-full max-h-[800px] w-full max-w-[960px] rounded-lg bg-white p-10 shadow-lg">
          <div className="relative flex h-full max-h-[512px] w-full max-w-[960px] bg-black">
            <div className="aspect-video h-full w-full bg-black" />
            <Stream
              className="absolute inset-0 z-10 aspect-video h-full w-full bg-black"
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
                    src={featured.imageUrl}
                    alt={featured.imageAlt}
                  />
                </div>
              </div>
            </div>
            <div className="mt-12 lg:col-span-2 lg:m-0 lg:pl-8">
              <Link to={`/blog/${featured.slug}`}>
                <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0 lg:py-20">
                  <h2 className="text-4xl font-extrabold text-white">
                    {featured.title}
                  </h2>
                  <p className="text-gray-200">{featured.category}</p>
                  <p className="mt-6 text-xl font-medium text-gray-50">
                    {featured.description}
                  </p>
                  <footer className="mt-6">
                    <div className="mt-6 flex items-center">
                      <div className="flex-shrink-0">
                        <a href={featured.authorWebsite}>
                          <span className="sr-only">{featured.author}</span>
                          <img
                            className="h-10 w-10 rounded-full"
                            src={featured.authorImage}
                            alt=""
                          />
                        </a>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">
                          <a
                            href={featured.authorWebsite}
                            className="hover:underline"
                          >
                            {featured.author}
                          </a>
                        </p>
                        <div className="flex space-x-1 text-sm text-gray-200">
                          <time dateTime={featured.published}>
                            {new Date(featured.published).toDateString()}
                          </time>
                          <span aria-hidden="true">&middot;</span>
                          <span>{readingTime(featured.body)} min read</span>
                        </div>
                      </div>
                    </div>
                  </footer>
                </div>
              </Link>
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
            {[1, 2, 3].map((i) => {
              const article = articles[i] ?? placeholder;
              return <ArticleCard key={article.title} {...article} />;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
