import { PlusIcon } from "@heroicons/react/outline";
import { Form } from "@remix-run/react";
import { Button } from "./Button";

export const ArticleCardNew = () => {
  return (
    <article className="flex w-full flex-col justify-center overflow-hidden rounded-lg shadow-lg">
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Administrator
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new article.
        </p>
        <div className="mt-6">
          <Form action="/admin/blog/new" method="post">
            <Button type="submit" primary>
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Article
            </Button>
          </Form>
        </div>
      </div>
    </article>
  );
};
