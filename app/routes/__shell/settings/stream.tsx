import { ActionFunction, Form, LoaderFunction, useLoaderData } from "remix";
import { Textbox } from "~/components/form";
import { requireAuthentication } from "~/services/auth.server";
import { fields } from "~/services/form.server";
import { svc } from "~/services/settings.server";
import { CloudflareDataFunctionArgs, StreamSettings } from "~/types";

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ request, context }) => {
    return svc(request, context, "stream").json();
  });

export const action: ActionFunction = (args) =>
  requireAuthentication(
    args,
    async ({ request, context }: CloudflareDataFunctionArgs) => {
      const formData = await request.formData();

      const stream = fields(formData, ["id", "title", "category"]);

      return svc(request, context, "stream").put(stream);
    }
  );

export default function SettingsStream() {
  const { id, title, category } = useLoaderData<StreamSettings>();

  return (
    <Form method="post">
      <div className="shadow sm:overflow-hidden sm:rounded-md">
        <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Stream
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Anything affecting the stream on the start page.
            </p>
          </div>
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-4">
              <Textbox label="Stream ID" name="id" readOnly defaultValue={id} />
            </div>

            <div className="col-span-6 sm:col-span-4">
              <Textbox label="Title" name="title" defaultValue={title} />
            </div>

            <div className="col-span-6 sm:col-span-4">
              <Textbox
                label="Category"
                name="category"
                defaultValue={category}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </Form>
  );
}
