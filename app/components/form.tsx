import cx from "clsx";
import { overrideTailwindClasses } from "tailwind-override";
import TextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";

const ocx = (...args: Parameters<typeof cx>) => {
  return overrideTailwindClasses(cx(...args));
};

export type TextboxProps = {
  label: string;
  name: string;
} & Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "name" | "id" | "type"
>;

export const Textbox: React.VFC<TextboxProps> = ({
  name,
  label,
  className,
  ...props
}) => {
  return (
    <>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        {...props}
        type="text"
        name={name}
        id={name}
        className={ocx(
          "mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm",
          className
        )}
      />
    </>
  );
};

export type PrefixTextboxProps = {
  label: string;
  name: string;
  prefix: string;
} & Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "name" | "id" | "type"
>;

export const PrefixTextbox: React.VFC<PrefixTextboxProps> = ({
  name,
  prefix,
  label,
  className,
  ...props
}) => {
  return (
    <>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
          {prefix}
        </span>
        <input
          {...props}
          type="text"
          name={name}
          id={name}
          className={ocx(
            "block w-full rounded-none rounded-r-md border border-gray-300 py-2 px-3 shadow-sm focus:border-orange-500 focus:outline-none sm:text-sm",
            className
          )}
        />
      </div>
    </>
  );
};

export type TextareaProps = {
  label: string;
  name: string;
  description: string;
} & Omit<
  TextareaAutosizeProps & React.RefAttributes<HTMLTextAreaElement>,
  "name" | "id"
>;

export const Textarea: React.VFC<TextareaProps> = ({
  name,
  description,
  label,
  rows = 3,
  ...props
}) => {
  return (
    <>
      <label
        htmlFor="about"
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="mt-1">
        <TextareaAutosize
          {...props}
          id={name}
          name={name}
          rows={rows}
          className={ocx(
            "mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-orange-500 focus:outline-none sm:text-sm"
          )}
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </>
  );
};
