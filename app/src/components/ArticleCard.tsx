import { Link } from "@remix-run/react";
import type { PublishedContent } from "~/types";
import { readingTime } from "~/utils/text";
import { Avatar } from "./Avatar";

export type ArticleProps = {
  children?: React.ReactNode;
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
  children,
}) => {
  return (
    <article className="relative flex w-full flex-col overflow-hidden rounded-lg shadow-lg">
      <div className="flex-shrink-0">
        <img className="h-48 w-full object-cover" src={imageUrl} alt="" />
      </div>
      <div className="flex flex-1 flex-col justify-between bg-white p-6">
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-600">
            <Link
              prefetch="intent"
              to={`/blog?category=${category}`}
              className="hover:underline"
            >
              {category}
            </Link>
          </p>
          <Link prefetch="intent" to={`/blog/${slug}`} className="mt-2 block">
            <p className="text-xl font-semibold text-gray-900">{title}</p>
            <p className="mt-3 text-base text-gray-500">{description}</p>
          </Link>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            <Avatar href={authorWebsite} image={authorImage} user={author} />
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
      {children}
    </article>
  );
};
