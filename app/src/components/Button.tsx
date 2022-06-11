import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { ocx } from "~/styles/cx";

type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  (
    | { primary?: never; danger?: never }
    | { primary: true; danger?: never }
    | { primary?: never; danger: true }
  );

export const Button: React.FC<ButtonProps> = ({
  primary = false,
  danger = false,
  className,
  ...props
}) => {
  const normal = !primary && !danger;

  return (
    <button
      className={ocx(
        {
          "border-transparent bg-red-600 text-white hover:bg-red-700": danger,
          "border-transparent bg-orange-600 text-white hover:bg-orange-700":
            primary,
          "border-gray-300 bg-white text-gray-700 hover:bg-gray-50": normal,
        },
        "inline-flex justify-center rounded-md border py-2 px-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
        className
      )}
      {...props}
    />
  );
};
