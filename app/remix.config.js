/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: "cloudflare-pages",
  serverDependenciesToBundle: ["remark"],
  server: "./server.js",
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: [".*"],
  appDirectory: "src",
  assetsBuildDirectory: "../public/build",
  serverBuildPath: "../functions/[[path]].js",
  // publicPath: "/build/",
  // devServerPort: 8002
};
