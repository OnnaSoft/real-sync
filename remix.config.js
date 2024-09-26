/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  // ... otras configuraciones
  serverDependenciesToBundle: [/^.*\.css$/],
};
