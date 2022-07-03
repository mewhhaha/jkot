import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { ocx } from "~/styles/cx";

type TexteditProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const Textedit: React.FC<TexteditProps> = ({ className, ...props }) => {
  return (
    <div className="group relative border-b-4 border-black">
      <input
        className={ocx("w-full focus:outline-none", className)}
        {...props}
      />
      <div className="h-1 w-full bg-black" />
      <div className="absolute bottom-0 h-1 w-full translate-y-full scale-x-0 transform bg-orange-600 transition-transform group-focus-within:scale-x-100" />
    </div>
  );
};
