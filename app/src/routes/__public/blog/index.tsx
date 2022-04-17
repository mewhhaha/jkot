import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import { ArticleCard } from "~/components/ArticleCard";
import type {
  CloudflareDataFunctionArgs,
  PublishedContent,
  UnpublishedContent,
} from "~/types";

type LoaderData = {
  articles: (PublishedContent | UnpublishedContent)[];
};

export const loader: LoaderFunction = async ({
  context,
}: CloudflareDataFunctionArgs): Promise<LoaderData> => {
  const latestArticles = await context.ARTICLE_KV.list({
    prefix: "date#",
  });
  const contents = await Promise.all(
    latestArticles.keys.map(({ name }) =>
      context.ARTICLE_KV.get<PublishedContent>(name, { type: "json" })
    )
  );
  return {
    articles: contents.filter(
      (content): content is PublishedContent => content !== null
    ),
  };
};

export default function Blog() {
  const { articles } = useLoaderData<LoaderData>();

  return (
    <div className="flex flex-grow justify-center">
      <section className="relative w-full bg-gray-50 px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
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
            {articles.map((article) => {
              return (
                <ArticleCard
                  key={article.title}
                  published=""
                  author=""
                  authorImage=""
                  authorWebsite=""
                  {...article}
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
