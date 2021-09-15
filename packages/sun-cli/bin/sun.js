const program = require("commander");
const fse = require("fs-extra");
const log = require("npmlog");
const { TEMP_PATH } = require("../src/utils/constant");

program
  .command("init [type] [npmName]")
  .description("通过模板初始化物料开发结构目录")
  .name("init")
  .on("--help", () => {
    console.log("");
    console.log("Examples:");
    console.log("  $ sun init");
    console.log("  $ sun init component");
  })
  .action(async (type, npmName, cmd) => {
    if (type && ["material", "component"].indexOf(type) === -1) {
      npmName = type;
      type = "material";
    }
    const options = {};
    options.npmName = npmName;
    options.type = type;
    try {
      await require("../src/command/init/init")(options);
    } catch (err) {
      await fse.remove(TEMP_PATH);
      log.error("初始化错误", err.message);
      console.error(err.stack);
      process.exit(1);
    }
  });

program.parse(process.argv);
