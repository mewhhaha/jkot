import type { ActionFunction, LoaderFunction } from "remix";
import { Form, useLoaderData, useTransition } from "remix";
import { Button } from "~/components/Button";
import { PrefixTextbox } from "~/components/form";
import { requireAuthentication } from "~/services/auth.server";
import { fields } from "~/services/form.server";
import * as settings from "~/services/settings.server";
import type { CloudflareDataFunctionArgs } from "~/types";

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ request, context }) => {
    return settings.item(request, context, "links").json();
  });

export const action: ActionFunction = (args) =>
  requireAuthentication(
    args,
    async ({ request, context }: CloudflareDataFunctionArgs) => {
      const formData = await request.formData();

      const links = fields(formData, ["github", "twitter"]);

      return settings.item(request, context, "links").put(links);
    }
  );

export default function SettingsHeader() {
  const { github, twitter } = useLoaderData<{
    github?: string;
    twitter?: string;
  }>();

  const transition = useTransition();

  return (
    <Form method="post">
      <fieldset disabled={transition.state !== "idle"}>
        <div className="relative shadow sm:overflow-hidden sm:rounded-md">
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button type="submit" primary>
              Save
            </Button>
          </div>
          <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Links
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Set up links for outside resources.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-4">
                <PrefixTextbox
                  label="Github"
                  name="github"
                  prefix="github.com/"
                  defaultValue={github}
                />
              </div>

              <div className="col-span-6 sm:col-span-4">
                <PrefixTextbox
                  label="Twitter"
                  name="twitter"
                  prefix="twitter.com/"
                  defaultValue={twitter}
                />
              </div>
            </div>
          </div>
        </div>
      </fieldset>
    </Form>
  );
}
