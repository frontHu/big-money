const fs = require("fs");
const inquirer = require("inquirer");
const log = require("npmlog");

module.exports = async (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      // 针对一些特殊的文件
      files = files.filter((filename) => {
        return (
          ["node_modules", ".git", ".DS_Store", ".iceworks-tmp"].indexOf(
            filename
          ) === -1
        );
      });
      log.verbose("checkEmpty", files.join(", "));
      if (files && files.length) {
        return inquirer
          .prompt({
            type: "confirm",
            name: "go",
            message: "当前目录中的现有文件。你确定要继续吗 ？",
            default: false,
          })
          .then((answer) => {
            return resolve(answer.go);
          })
          .catch(() => {
            return resolve(false);
          });
      }
      return resolve(true);
    });
  });
};
