import { Link } from "remix";
import { PublishedContent } from "~/types";

export type ArticleProps = PublishedContent;

export const ArticleCard: React.VFC<ArticleProps> = ({
  title,
  imageUrl,
  category,
  description,
  slug,
  author,
  body,
}) => {
  const readingTime = `${body.split(" ").length / 200} min`;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg shadow-lg">
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
            <a href={author.href}>
              <span className="sr-only">{author.name}</span>
              <img
                className="h-10 w-10 rounded-full"
                src={author.imageUrl}
                alt=""
              />
            </a>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              <a href={author.href} className="hover:underline">
                {author.name}
              </a>
            </p>
            <div className="flex space-x-1 text-sm text-gray-500">
              <time dateTime={datetime}>{date}</time>
              <span aria-hidden="true">&middot;</span>
              <span>{readingTime} read</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
