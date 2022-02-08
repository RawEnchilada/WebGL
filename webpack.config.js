module.exports ={
    mode: "development",
    devtool: "inline-source-map",
    entry: "./script.ts",
    output: {
        filename: "bundle.js"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    }
}