import TextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";
import { ocx } from "~/styles/cx";

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
