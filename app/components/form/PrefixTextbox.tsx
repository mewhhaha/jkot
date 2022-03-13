import { ocx } from "~/styles/cx";

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
