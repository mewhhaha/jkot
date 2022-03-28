import { EyeIcon } from "@heroicons/react/outline";
import { useRef, useCallback, useEffect } from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from "remix";
import { PrefixTextbox } from "~/components/form";
import { Modal } from "~/components/Modal";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";

const SLUG_NAME = "slug";

type LoaderData = string;
type ActionData = string;

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, ({ params }): LoaderData => {
    // if (!params.slug) {
    //   throw new Response("Not found", { status: 404 });
    // }

    return params.slug;
  });

export const action: ActionFunction = (args) =>
  requireAuthentication(
    args,
    async ({ request, context, params }): Promise<ActionData | Response> => {
      const requestedSlug = (await request.formData())
        .get(SLUG_NAME)
        ?.toString();

      if (!requestedSlug) {
        return "Slug is undefined";
      }

      if (requestedSlug === params.slug) {
        return "Slug is identical to previous slug";
      }

      const fromDO = item(request, context, `article/${params.slug}`);
      const from = await fromDO.json();

      if (from.status !== "unpublished") {
        return "Article is not unpublished";
      }

      if (from.id === undefined || from.slug === undefined) {
        return "Article has no reference";
      }

      const toDO = item(request, context, `article/${requestedSlug}`);

      if ((await toDO.json()).id !== undefined) {
        return "Slug already exists";
      }

      await Promise.all([
        fromDO.delete(),
        toDO.put({ ...from, slug: requestedSlug }),
      ]);

      return redirect(`/blog/${requestedSlug}/edit`);
    }
  );

export default function Publish() {
  const ref = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const slug = useLoaderData<LoaderData>();
  const validation = useActionData<ActionData>();

  useEffect(() => {
    if (!validation) return;
    ref.current?.setCustomValidity(validation);
  }, [validation]);

  const handleClose = useCallback(() => {
    navigate("../");
  }, [navigate]);

  return (
    <Modal initialFocus={ref} open onClose={handleClose}>
      <Modal.Confirm
        title="Change slug"
        icon={<EyeIcon className="h-6 w-6 text-green-600" aria-hidden="true" />}
      >
        The slug will be the accessible named used in the URL. The slug has to
        be lowercase separated by dashes. Try having an accessible name that is
        similar to your title.
      </Modal.Confirm>
      <Form method="post">
        <PrefixTextbox
          ref={ref}
          className="invalid:border-red-600"
          label="New slug"
          minLength={1}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          prefix="/blog/"
          name={SLUG_NAME}
          defaultValue={slug}
        />
        <Modal.CancelAccept onCancel={handleClose}>Confirm</Modal.CancelAccept>
      </Form>
    </Modal>
  );
}
