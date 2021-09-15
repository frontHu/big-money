const fse = require("fs-extra");
const progress = require("request-progress");
const zlib = require("zlib");
const {
  getAndExtractTarball,
  getNpmTarball,
} = require("../../../../sun-npm-utils/src");

module.exports = async (dir, template, registry) => {
  // fse.emptyDir(dir);
  const isLocalPath = /^[./]|(^[a-zA-Z]:)/.test(template);
  if (isLocalPath) {
    await fse.copy(template, dir);
  } else {
    const tarballURL = await getNpmTarball(template, "latest", registry);

    console.log("正在下载模板", tarballURL);
    const spinner = ora("开始下载").start();

    await getAndExtractTarball(
      dir,
      tarballURL,
      (state) => {
        spinner.text = `download npm tarball progress: ${Math.floor(
          state.percent * 100
        )}%`;
      },
      (filename) => {
        if (filename === "_package.json") {
          // 兼容
          filename = "package.json.ejs";
        }
        return filename;
      }
    );
  }
};
