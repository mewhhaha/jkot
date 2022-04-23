import { PencilIcon } from "@heroicons/react/outline";
import { Link } from "remix";

type ArticleCardUnpublishedProps = {
  slug: string;
};

export const ArticleCardUnpublished: React.VFC<ArticleCardUnpublishedProps> = ({
  slug,
}) => {
  return (
    <article className="flex flex-col justify-center overflow-hidden rounded-lg shadow-lg">
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
          Edit an unpublished article.
        </p>
        <div className="mt-6">
          <Link to={`/admin/blog/${slug}/edit`}>
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Edit Article
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
};
