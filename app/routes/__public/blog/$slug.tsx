import { LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { ArticleFull } from "~/components/ArticleFull";
import { articleKeys } from "~/services/article.server";
import { CloudflareDataFunctionArgs, PublishedContent } from "~/types";

type LoaderData = PublishedContent;

export const meta: MetaFunction = ({ data }: { data: LoaderData }) => {
  return {
    title: data.title,
    description: data.description,
  };
};

export const loader: LoaderFunction = async ({
  context,
  params,
}: CloudflareDataFunctionArgs): Promise<LoaderData> => {
  const slug = params.slug === "empty" ? "" : params.slug;
  if (slug === undefined) {
    throw new Error("Invariant violated");
  }

  const content = await context.ARTICLE_KV.get<PublishedContent>(
    articleKeys({ slug }).slugKey,
    { type: "json" }
  );

  if (content === null) {
    throw new Response("Not found", { status: 404 });
  }

  return content;
};

export default function Article() {
  const content = useLoaderData<LoaderData>();
  return (
    <ArticleFull
      title={content.title}
      category={content.category}
      description={content.description}
      imageUrl={content.imageUrl}
      imageAlt={content.imageAlt}
      imageAuthor={content.imageAuthor}
    >
      {content.body}
    </ArticleFull>
  );
}
