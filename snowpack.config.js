// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    'docs-src': '/',
    src: '/src',
    lib: '/lib'
  },
  plugins: [
    /* ... */
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    port: 2001
  },
  buildOptions: {
    out: 'docs'
  },
  optimize: {
    bundle: true,
    minify: true,
    treeshake: true
  }
}
