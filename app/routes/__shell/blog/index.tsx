import { LoaderFunction, useLoaderData } from "remix";
import { Auth0Profile } from "remix-auth-auth0";
import { ArticleCard } from "~/components/ArticleCard";
import { ArticleCardNew } from "~/components/ArticleCardNew";
import { ArticleCardUnpublished } from "~/components/ArticleCardUnpublished";
import { blurbs } from "~/mocks/blurbs";
import { createAuthenticator } from "~/services/auth.server";
import { all, isArticleKey } from "~/services/settings.server";
import { ArticleSettings, CloudflareDataFunctionArgs } from "~/types";
import { required } from "~/utils/record";

type LoaderData = {
  user: Auth0Profile | null;
  articles: Required<ArticleSettings>[];
};

export const loader: LoaderFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs): Promise<LoaderData> => {
  const authenticator = createAuthenticator(request, context);
  const user = await authenticator.isAuthenticated(request);

  let articles: Required<ArticleSettings>[] = [];
  if (user) {
    const settings = await all(request, context).json();
    for (const key in settings) {
      if (!isArticleKey(key)) continue;

      const article = settings[key];
      if (article === undefined) continue;

      if (required(article, ["id", "slug", "status"])) {
        articles.push(article);
      }
    }
  }

  return { user, articles };
};

export default function Blog() {
  const { user, articles } = useLoaderData<LoaderData>();

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
              return (
                <ArticleCardUnpublished
                  key={article.slug}
                  slug={article.slug}
                />
              );
            })}
            {blurbs.map((blurb) => (
              <ArticleCard key={blurb.title} {...blurb} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
