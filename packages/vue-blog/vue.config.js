module.exports = {
  pages: {
    index: {
      entry: 'src/main.js'
    }
  },
  chainWebpack: (config) => {
    config.plugins.delete('fork-ts-checker')
    config.module.rules.delete('postcss')//plugins.delete('fork-ts-checker')
  }
}
