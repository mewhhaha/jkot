import { PencilIcon } from "@heroicons/react/outline";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import type { Auth0Profile } from "remix-auth-auth0";
import { ArticleCard } from "~/components/ArticleCard";
import { ArticleCardNew } from "~/components/ArticleCardNew";
import { Button } from "~/components/Button";
import { CardList } from "~/components/CardList";
import { article } from "~/services/article.server";
import { requireAuthentication } from "~/services/auth.server";
import { all, isArticleKey } from "~/services/settings.server";
import type {
  ArticleSettings,
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

export const loader: LoaderFunction = (props) =>
  requireAuthentication(
    props,
    async ({ request, context }, user): Promise<LoaderData> => {
      const settings = await all(request, context).json();
      const requests = Object.entries(settings)
        .filter(
          (entry): entry is [`article/${string}`, ValidatedArticleSettings] => {
            const value = entry[1] as ArticleSettings;
            const key = entry[0];
            return (
              isArticleKey(key) && required(value, ["id", "slug", "status"])
            );
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
    }
  );

export default function Blog() {
  const { user, articles } = useLoaderData<LoaderData>();

  return (
    <div className="flex flex-grow justify-center">
      <CardList
        title="From the blog"
        description="These are my thoughts. It's a mix of useful and stupidity. But I won't tell you which is which."
      >
        {user !== null && (
          <li>
            <ArticleCardNew />
          </li>
        )}
        {articles.map((article) => {
          return (
            <li key={article.title}>
              <ArticleCard
                published=""
                author=""
                authorImage=""
                authorWebsite=""
                {...article}
              >
                <div className="absolute top-2 right-2">
                  <Link
                    prefetch="intent"
                    to={`/admin/blog/${article.slug}/edit`}
                  >
                    <Button type="submit">
                      <PencilIcon
                        className="-mx-1 h-5 w-5"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Edit Article</span>
                    </Button>
                  </Link>
                </div>
              </ArticleCard>
            </li>
          );
        })}
      </CardList>
    </div>
  );
}
