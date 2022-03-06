export type Env = {
  ORIGIN: string;
  ARTICLE_DO: DurableObjectNamespace;
  SETTINGS_DO: DurableObjectNamespace;
};

export type Content = {
  title: string;
  category: string;
  description: string;
  created: string;
  modified: string;
  imageUrl: string;
  imageAlt: string;
  imageAuthor: string;
  body: string;
};

export type Message =
  | [type: "latest", data: Content]
  | [
      type:
        | "title"
        | "category"
        | "description"
        | "imageUrl"
        | "imageAlt"
        | "imageAuthor",
      text: string
    ]
  | [type: "c-add", data: [position: number, text: string]]
  | [type: "c-remove", data: [from: number, to: number]];
