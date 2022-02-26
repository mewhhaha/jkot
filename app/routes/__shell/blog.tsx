import { PlusIcon } from "@heroicons/react/outline";
import { Form, LoaderFunction, useLoaderData } from "remix";
import { Auth0Profile } from "remix-auth-auth0";
import { ArticleBlurb, ArticleCard } from "~/components/ArticleCard";
import { blurbs } from "~/services/article.server";
import { createAuthenticator } from "~/services/auth.server";
import { CloudflareDataFunctionArgs } from "~/types";

const NewArticleCard = () => {
  return (
    <div className="flex flex-col justify-center overflow-hidden rounded-lg shadow-lg">
      <div className="py-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new project.
        </p>
        <div className="mt-6">
          <Form action="/blog/new" method="post">
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Article
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export const loader: LoaderFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs) => {
  const authenticator = createAuthenticator(request, context);
  const user = await authenticator.isAuthenticated(request);

  return { user, blurbs };
};

export default function Blog() {
  const { user, blurbs } = useLoaderData<{
    user: Auth0Profile | undefined;
    blurbs: ArticleBlurb[];
  }>();

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
            {user !== null && <NewArticleCard />}
            {blurbs.map((blurb) => (
              <ArticleCard {...blurb} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
