export { Settings } from "./settings";
export { Article } from "./article";
export default {
  fetch() {
    return new Response("Not Found", { status: 404 });
  },
};
