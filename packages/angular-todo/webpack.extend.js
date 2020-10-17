module.exports= {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  module: {
    rules: [
      {
		    test: /\.mjs$/,
		    type: 'javascript/auto',
			}
    ]
  }
}
