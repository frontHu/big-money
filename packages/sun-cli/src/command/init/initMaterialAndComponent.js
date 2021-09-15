const path = require("path");
const fse = require("fs-extra");
const chalk = require("chalk");
const inquirer = require("inquirer");
const log = require("npmlog");
const { TEMP_PATH } = require("../../utils/constant");
const downloadMaterialTemplate = require("./downloadMaterialTemplate");
module.exports = async ({
  cwd,
  projectType,
  template,
  templateFramework,
  templateLanguage,
}) => {
  log.verbose("初始化", projectType, template);

  // const registry = await getNpmRegistry(template, null, null, true)
  // 目前先写死为npm源
  const registry = "https://registry.npm.taobao.org";
  const tempMaterialDir = TEMP_PATH;
  await downloadMaterialTemplate(tempMaterialDir, template, registry);
};
