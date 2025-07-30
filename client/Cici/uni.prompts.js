module.exports = {
  h5: {
    devServer: {
      port: 8080,
      open: true,
      https: false,
      hotOnly: false,
      disableHostCheck: true,
      host: "0.0.0.0"
    },
    publicPath: "/",
    router: {
      mode: "hash",
      base: "/"
    },
    async: {
      loading: "AsyncLoading",
      error: "AsyncError", 
      delay: 20,
      timeout: 60000
    },
    devtool: false,
    optimization: {
      treeShaking: {
        enable: true
      }
    }
  }
}
