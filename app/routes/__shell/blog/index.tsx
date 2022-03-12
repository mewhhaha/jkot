import { LoaderFunction, useLoaderData } from "remix";
import { Auth0Profile } from "remix-auth-auth0";
import { ArticleCard } from "~/components/ArticleCard";
import { ArticleCardNew } from "~/components/ArticleCardNew";
import { ArticleCardUnpublished } from "~/components/ArticleCardUnpublished";
import { article } from "~/services/article.server";
import { createAuthenticator } from "~/services/auth.server";
import { all, isArticleKey } from "~/services/settings.server";
import {
  ArticleSettings,
  CloudflareDataFunctionArgs,
  PublishedContent,
  UnpublishedContent,
} from "~/types";
import { required } from "~/utils/record";

type ValidatedArticleSettings = Required<
  Pick<ArticleSettings, "id" | "slug" | "status">
> &
  Pick<ArticleSettings, "published">;

type LoaderData = {
  user: Auth0Profile | null;
  articles: (PublishedContent | UnpublishedContent)[];
};

export const loader: LoaderFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs): Promise<LoaderData> => {
  const authenticator = createAuthenticator(request, context);
  const user = await authenticator.isAuthenticated(request);

  if (user) {
    const settings = await all(request, context).json();
    const requests = Object.entries(settings)
      .filter(
        (entry): entry is [`article/${string}`, ValidatedArticleSettings] => {
          const value = entry[1] as ArticleSettings;
          const key = entry[0];
          return isArticleKey(key) && required(value, ["id", "slug", "status"]);
        }
      )
      .map(async ([, value]) => {
        const content = await article(request, context, value.id).read();

        return {
          ...content,
          slug: value.slug,
          published: value.published,
          status: value.status,
        };
      });

    const articles = await Promise.all(requests);

    return { user, articles };
  } else {
    const latestArticles = await context.ARTICLE_KV.list({
      prefix: "date#",
    });
    const contents = await Promise.all(
      latestArticles.keys.map(({ name }) =>
        context.ARTICLE_KV.get<PublishedContent>(name, { type: "json" })
      )
    );
    return {
      user: null,
      articles: contents.filter(
        (content): content is PublishedContent => content !== null
      ),
    };
  }
};

export default function Blog() {
  const { user, articles } = useLoaderData<LoaderData>();

  console.log(articles);

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
            {user !== null && <ArticleCardNew />}
            {articles.map((article) => {
              return "author" in article ? (
                <ArticleCard key={article.title} {...article} />
              ) : (
                <ArticleCardUnpublished
                  key={article.slug}
                  slug={article.slug}
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
