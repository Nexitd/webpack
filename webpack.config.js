const path = require("path");
const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const {
    CleanWebpackPlugin
} = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExctractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const {
    BundleAnalyzerPlugin
} = require("webpack-bundle-analyzer");

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: "all",
        },
    };

    if (isProd) {
        config.minimizer = [
            new CssMinimizerPlugin(),
            new TerserWebpackPlugin(),
        ];
    }

    return config;
};

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[hash].${ext}`);

const cssLoaders = (extra) => {
    const loaders = [{
            loader: MiniCssExctractPlugin.loader,
            options: {},
        },
        "css-loader",
    ];

    if (extra) {
        loaders.push(extra);
    }

    return loaders;
};

const babelOptions = (preset) => {
    const opts = {
        presets: ["@babel/preset-env"],
        plugins: ["@babel/plugin-proposal-class-properties"],
    };

    if (preset) {
        opts.presets.push(preset);
    }

    return opts;
};

const jsLoaders = () => {
    const loaders = [{
        loader: "babel-loader",
        options: babelOptions(),
    }, ];

    if (isDev) {
        loaders.push("eslint-loader");
    }

    return loaders;
};

// Разблокировать, чтобы использовать вебпак для многостраничных сайтов

// const generateHtmlPlugin = (title) => {
//     return new HTMLWebpackPlugin({
//         title,
//         filename: `${title.toLowerCase()}.html`,
//         template: `./${title.toLowerCase()}.html`,
//         minify: {
//             collapseWhitespace: false,
//             removeComments: true,
//             removeRedundantAttributes: true,
//             removeScriptTypeAttributes: true,
//             removeStyleLinkTypeAttributes: true,
//             useShortDoctype: true
//         }
//     });
// }

// const populateHtmlPlugins = (pagesArray) => {
//     res = [];
//     pagesArray.forEach(page => {
//         res.push(generateHtmlPlugin(page));
//     })
//     return res;
// }

// const pages = populateHtmlPlugins(["index"]);

const plugins = () => {
    const base = [
        // new HTMLWebpackPlugin({
        //     template: "/index.html",
        //     minify: {
        //         collapseWhitespace: isProd,
        //     },
        // }),

        // new HTMLWebpackPlugin({
        //     template: "/indexENG.html",
        //     minify: {
        //         collapseWhitespace: isProd,
        //     },
        // }),
        // ...pages,

        new CleanWebpackPlugin(),

        new CopyPlugin({
            patterns: [{
                from: path.resolve(__dirname, "src/assets/images/*/*"),
                to: path.resolve(__dirname, "dist"),
                noErrorOnMissing: true
            }, ],
        }),

        new MiniCssExctractPlugin({
            filename: filename("css"),
        }),

        new ImageminPlugin({
            disable: process.env.NODE_ENV !== "production", // Disable during development
            pngquant: {
                quality: "95-100",
            },
            test: /\.(jpe?g|png|gif|svg)$/i,
        }),

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default']
        })
    ];

    return base;
};

module.exports = {
    context: path.resolve(__dirname, "src"),
    mode: "development",
    entry: {
        main: ["@babel/polyfill", "./index.js"],
        // eng: ["@babel/polyfill", "./eng.js"]
    },

    output: {
        filename: filename("js"),
        path: path.resolve(__dirname, "dist"),
    },

    resolve: {
        extensions: [".js", ".json", ".png"],
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },

    optimization: optimization(),

    devServer: {
        port: 4200,
        hot: isDev,
    },

    devtool: isDev ? "source-map" : false,

    plugins: plugins(),

    module: {
        rules: [{
                test: /\.scss$/,
                use: [{
                        loader: 'style-loader'
                    },
                    {
                        loader: MiniCssExctractPlugin.loader,
                        options: {
                            esModule: false,

                        },
                    }, "css-loader",
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                config: path.resolve(__dirname, 'postcss.config.js')
                            }
                        }
                    },
                    {
                        loader: 'sass-loader',
                    }
                ],
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|gif|svg|jpg|ttf|wof|wof2|eot)$/,
                use: ["file-loader"],
            },
            {
                test: /\.xml$/,
                use: ["xml-loader"],
            },
            {
                test: /\.csv$/,
                use: ["csv-loader"],
            },
            {
                test: /\.js$/,
                exclude: "/node_modules/",
                use: jsLoaders(),
            },
        ],
    },
};