import { ocx } from "~/styles/cx";

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

export const Textbox: React.FC<TextboxProps> = ({
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
