import type { ActionFunction, LoaderFunction } from "remix";
import { Form, useLoaderData, useTransition } from "remix";
import { Button } from "~/components/Button";
import { Textarea, Textbox } from "~/components/form";
import { requireAuthentication } from "~/services/auth.server";
import { fields } from "~/services/form.server";
import * as settings from "~/services/settings.server";
import type { CloudflareDataFunctionArgs, ProfileSettings } from "~/types";

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ request, context }) => {
    return settings.item(request, context, "profile").json();
  });

export const action: ActionFunction = (args) =>
  requireAuthentication(
    args,
    async ({ request, context }: CloudflareDataFunctionArgs) => {
      const formData = await request.formData();

      const links = fields(formData, ["username", "about"]);

      return settings.item(request, context, "profile").put(links);
    }
  );

export default function SettingsIndex() {
  const { username, about } = useLoaderData<ProfileSettings>();

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
                Profile
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This information will be displayed publicly so be careful what
                you share.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 sm:col-span-2">
                <Textbox
                  label="Username"
                  defaultValue={username}
                  name="username"
                />
              </div>

              <div className="col-span-3">
                <Textarea
                  label="About"
                  name="about"
                  defaultValue={about}
                  placeholder="you@example.com"
                  description="Brief description for your profile."
                />
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Photo
                </label>
                <div className="mt-1 flex items-center">
                  <span className="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                    <svg
                      className="h-full w-full text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                  <Button type="button" className="ml-5">
                    Change
                  </Button>
                </div>
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Cover photo
                </label>
                <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          // name="file-upload"
                          type="file"
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>
    </Form>
  );
}
