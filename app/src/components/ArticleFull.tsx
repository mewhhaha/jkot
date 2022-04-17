import { CameraIcon } from "@heroicons/react/solid";
import Markdown from "markdown-to-jsx";
import { useLayoutEffect, useRef } from "react";
import "~/styles/prism.css";
import Prism from "~/styles/prism";

type ArticleFullProps = {
  title: string;
  category: string;
  description: string;
  children: string;
  imageUrl: string;
  imageAlt: string;
  imageAuthor: string;
};

export const ArticleFull: React.FC<ArticleFullProps> = ({
  title,
  category,
  description,
  imageUrl,
  imageAlt,
  imageAuthor,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setTimeout(async () => {
      const self = ref.current?.childNodes?.[0]?.parentNode;
      if (!self) return;
      Prism.highlightAllUnder(self);
    });
  });

  return (
    <article className="h-full w-full overflow-hidden bg-white">
      <div className="relative mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 bottom-0 left-3/4 hidden w-screen bg-gray-50 lg:block" />
        <div className="mx-auto max-w-prose text-base lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 className="text-base font-semibold uppercase tracking-wide text-orange-600">
              {category}
            </h2>
            <h3 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
              {title}
            </h3>
          </div>
        </div>
        <div className="mt-8 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="relative lg:col-start-2 lg:row-start-1">
            <svg
              className="absolute top-0 right-0 -mt-20 -mr-20 hidden lg:block"
              width={404}
              height={384}
              fill="none"
              viewBox="0 0 404 384"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="de316486-4a29-4312-bdfc-fbce2132a2c1"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width={404}
                height={384}
                fill="url(#de316486-4a29-4312-bdfc-fbce2132a2c1)"
              />
            </svg>
            <div className="relative mx-auto max-w-prose text-base lg:max-w-none">
              <figure>
                <div className="aspect-w-12 aspect-h-7 lg:aspect-none">
                  <img
                    className="rounded-lg object-cover object-center shadow-lg"
                    src={
                      imageUrl ||
                      "https://images.unsplash.com/photo-1546913199-55e06682967e?ixlib=rb-1.2.1&auto=format&fit=crop&crop=focalpoint&fp-x=.735&fp-y=.55&w=1184&h=1376&q=80"
                    }
                    alt={imageAlt}
                    width={1184}
                    height={1376}
                  />
                </div>
                <figcaption className="mt-3 flex text-sm text-gray-500">
                  <CameraIcon
                    className="h-5 w-5 flex-none text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="ml-2">Image by {imageAuthor}</span>
                </figcaption>
              </figure>
            </div>
          </div>
          <div className="mt-8 lg:mt-0">
            <div className="mx-auto max-w-prose text-base lg:max-w-none">
              <p className="text-lg text-gray-500">{description}</p>
            </div>
            <div
              className="prose prose-orange mx-auto mt-5 text-gray-500 lg:col-start-1 lg:row-start-1 lg:max-w-none"
              ref={ref}
            >
              <Markdown>{children}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
