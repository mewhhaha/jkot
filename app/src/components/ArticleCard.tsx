import { PencilIcon } from "@heroicons/react/outline";
import { Link } from "remix";
import type { PublishedContent } from "~/types";
import { readingTime } from "~/utils/text";
import { Button } from "./Button";

export type ArticleProps = {
  edit?: boolean;
} & PublishedContent;

export const ArticleCard: React.FC<ArticleProps> = ({
  title,
  imageUrl,
  category,
  description,
  slug,
  author,
  authorWebsite,
  published,
  authorImage,
  body,
  edit,
}) => {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-lg shadow-lg">
      <div className="flex-shrink-0">
        <img className="h-48 w-full object-cover" src={imageUrl} alt="" />
      </div>
      <div className="flex flex-1 flex-col justify-between bg-white p-6">
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-600">
            <Link to={`/blog?category=${category}`} className="hover:underline">
              {category}
            </Link>
          </p>
          <Link to={`/blog/${slug}`} className="mt-2 block">
            <p className="text-xl font-semibold text-gray-900">{title}</p>
            <p className="mt-3 text-base text-gray-500">{description}</p>
          </Link>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            <a href={authorWebsite}>
              <span className="sr-only">{author}</span>
              <img
                className="h-10 w-10 rounded-full"
                src={authorImage}
                alt=""
              />
            </a>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              <a href={authorWebsite} className="hover:underline">
                {author}
              </a>
            </p>
            <div className="flex space-x-1 text-sm text-gray-500">
              <time dateTime={published}>
                {new Date(published).toDateString()}
              </time>
              <span aria-hidden="true">&middot;</span>
              <span>{readingTime(body)} min read</span>
            </div>
          </div>
        </div>
      </div>
      {edit && (
        <div className="absolute top-2 right-2">
          <Link to={`/admin/blog/${slug}/edit`}>
            <Button type="submit">
              <PencilIcon className="-mx-1 h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Edit Article</span>
            </Button>
          </Link>
        </div>
      )}
    </article>
  );
};
