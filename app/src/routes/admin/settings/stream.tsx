import { Listbox } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/outline";
import cx from "clsx";
import { useState } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { Button } from "~/components/Button";
import { Textbox } from "~/components/form";
import { requireAuthentication } from "~/services/auth.server";
import { categories } from "~/services/category";
import { fields } from "~/services/form.server";
import * as settings from "~/services/settings.server";
import type { CloudflareDataFunctionArgs, StreamSettings } from "~/types";
import { ocx } from "~/styles/cx";

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, ({ request, context }) => {
    return settings.item(request, context, "stream").json();
  });

export const action: ActionFunction = (args) =>
  requireAuthentication(
    args,
    async ({ request, context }: CloudflareDataFunctionArgs) => {
      const formData = await request.formData();

      const stream = fields(formData, ["id", "title", "category"]);

      await context.CACHE_KV.put("stream", JSON.stringify(stream));
      return settings.item(request, context, "stream").put(stream);
    }
  );

type CategoryListboxProps = {
  className?: string;
  defaultValue: string | undefined;
  label: string;
  name: string;
};

const CategoryListbox: React.FC<CategoryListboxProps> = ({
  className,
  defaultValue,
  label,
  name,
}) => {
  const [selected, setSelected] = useState(defaultValue);

  return (
    <Listbox as="div" value={selected} onChange={setSelected} name={name}>
      <Listbox.Label className="block text-sm font-medium text-gray-700">
        {label}
      </Listbox.Label>
      <div className="relative mt-1">
        <Listbox.Button
          className={ocx(
            "relative w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm",
            className
          )}
        >
          <span className="block truncate">{selected}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <SelectorIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {Object.keys(categories).map((cat) => (
            <Listbox.Option
              key={cat}
              value={cat}
              className={({ active }) =>
                cx(
                  "relative cursor-default select-none py-2 pl-3 pr-9",
                  active ? "bg-orange-600 text-white" : "text-gray-900"
                )
              }
            >
              {({ active, selected }) => (
                <>
                  <span
                    className={cx(
                      "block truncate",
                      selected && "font-semibold"
                    )}
                  >
                    {cat}
                  </span>

                  {selected && (
                    <span
                      className={cx(
                        "absolute inset-y-0 right-0 flex items-center pr-4",
                        active ? "text-white" : "text-orange-600"
                      )}
                    >
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

export default function SettingsStream() {
  const { id, title, category } = useLoaderData<StreamSettings>();
  const transition = useTransition();

  return (
    <Form method="post">
      <fieldset disabled={transition.state !== "idle"}>
        <div className="relative shadow sm:rounded-md">
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button type="submit" primary>
              Save
            </Button>
          </div>
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
                <Textbox label="Stream ID" name="id" defaultValue={id} />
              </div>

              <div className="col-span-6 sm:col-span-4">
                <Textbox label="Title" name="title" defaultValue={title} />
              </div>

              <div className="col-span-3">
                <CategoryListbox
                  className="w-60"
                  label="Category"
                  name="category"
                  defaultValue={category}
                />
              </div>
            </div>
          </div>
        </div>
      </fieldset>
    </Form>
  );
}
