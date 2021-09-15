const urlJoin = require("url-join");
const semver = require("semver");
const request = require("request");
const progress = require("request-progress");
/**
 * 从 registry 获取 npm 的信息
 */
async function getNpmInfo(npm, registry) {
  const register = registry || "https://registry.npm.taobao.org";
  const url = urlJoin(register, npm);
  return await request.get(url, (response) => {
    let body;
    try {
      body = JSON.parse(response);
    } catch (error) {
      return Promise.reject(error);
    }
    return body;
  });
}
/**
 * 获取指定 npm 包版本的 tarball
 */
function getNpmTarball(npm, version, registry) {
  return getNpmInfo(npm, registry).then((json) => {
    if (!semver.valid(version)) {
      // support beta or other tag
      console.log(npm, "npm");
      console.log(version, "version");
      console.log(registry, "registry");
      console.log(json["dist-tags"], "json");
      version = json["dist-tags"][version] || json["dist-tags"].latest;
    }

    if (
      semver.valid(version) &&
      json.versions &&
      json.versions[version] &&
      json.versions[version].dist
    ) {
      return json.versions[version].dist.tarball;
    }

    return Promise.reject(
      new Error(`没有在 ${registry} 源上找到 ${npm}@${version} 包`)
    );
  });
}

/**
 * 获取 tar 并将其解压到指定的文件夹
 */
function getAndExtractTarball(
  destDir,
  tarball,
  progressFunc = () => {},
  formatFilename = (filename) => {
    if (filename === "_package.json") {
      return filename.replace(/^_/, "");
    } else {
      return filename.replace(/^_/, ".");
    }
  }
) {
  return new Promise((resolve, reject) => {
    const allFiles = [];
    const allWriteStream = [];
    const dirCollector = [];

    progress(
      request({
        url: tarball,
        timeout: 10000,
      })
    )
      .on("progress", progressFunc)
      .on("error", reject)
      // @ts-ignore
      .pipe(zlib.Unzip())
      // @ts-ignore
      .pipe(new tar.Parse())
      .on("entry", (entry) => {
        if (entry.type === "Directory") {
          entry.resume();
          return;
        }

        const realPath = entry.path.replace(/^package\//, "");

        let filename = path.basename(realPath);
        filename = formatFilename(filename);

        const destPath = path.join(destDir, path.dirname(realPath), filename);
        const dirToBeCreate = path.dirname(destPath);
        if (!dirCollector.includes(dirToBeCreate)) {
          dirCollector.push(dirToBeCreate);
          mkdirp.sync(dirToBeCreate);
        }

        allFiles.push(destPath);
        allWriteStream.push(
          new Promise((streamResolve) => {
            entry
              .pipe(fs.createWriteStream(destPath))
              .on("finish", () => streamResolve())
              .on("close", () => streamResolve()); // resolve when file is empty in node v8
          })
        );
      })
      .on("end", () => {
        if (progressFunc) {
          progressFunc({
            percent: 1,
          });
        }

        Promise.all(allWriteStream)
          .then(() => resolve(allFiles))
          .catch(reject);
      });
  });
}

module.exports = {
  getNpmTarball,
  getNpmInfo,
  getAndExtractTarball,
};
