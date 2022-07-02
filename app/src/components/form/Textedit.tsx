import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

type TexteditProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const Textedit: React.FC<TexteditProps> = (props) => {
  return (
    <div className="group duration-150 after:block after:h-2 after:w-full after:scale-x-0 after:transform after:bg-black after:transition after:group-focus:scale-x-100 after:group-focus:bg-orange-600">
      <input {...props} />
    </div>
  );
};
