({
  baseUrl: ".",
  uglify: {
  },
  name: "vendor/almond",
  mainConfigFile: "config.js",
  include: ["config"],
  insertRequire: ["config"],
  out: "main-built.js"
})