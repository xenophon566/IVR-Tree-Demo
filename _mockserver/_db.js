const Path = require("path");
const glob = require("glob");
const apiFiles = glob.sync(Path.resolve(__dirname, "./") + "/**/[!_]*.js", {
    nodir: true,
});

let data = {};
apiFiles.forEach((filePath) => {
    const apiContent = require(filePath);
    let [, url] = filePath.split("_mockserver/"); // e.g. comments.js
    url =
        url.slice(url.length - 9) === "/index.js"
            ? url.slice(0, url.length - 9) // remove /index.js
            : url.slice(0, url.length - 3); // remove .js

    urlPath = url.replace(/\//g, "-");
    data[urlPath] = apiContent;
});

module.exports = () => {
    return data;
};
