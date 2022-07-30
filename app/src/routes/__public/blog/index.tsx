import type { LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { ArticleCard } from "~/components/ArticleCard";
import { CardList } from "~/components/CardList";
import type { CloudflareDataFunctionArgs, PublishedContent } from "~/types";

type LoaderData = {
  articles: PublishedContent[];
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
  const [search] = useSearchParams();
  const { articles } = useLoaderData<LoaderData>();

  const byCategory = (a: PublishedContent) => {
    const category = search.get("category");
    if (!category) return true;
    return a.category === category;
  };

  return (
    <div className="flex flex-grow justify-center">
      <CardList
        title="From the blog"
        description="These are my thoughts. It's a mix of useful and stupidity. But I won't tell you which is which."
      >
        {articles.filter(byCategory).map((article) => {
          return (
            <li key={article.title} className="flex h-full">
              <ArticleCard
                {...article}
              />
            </li>
          );
        })}
      </CardList>
    </div>
  );
}
