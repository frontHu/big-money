const log = require("npmlog");
const inquirer = require("inquirer");
const checkEmpty = require("../../utils/checkEmpty");
const initMaterialAndComponent = require("./initMaterialAndComponent");

module.exports = async (options) => {
  const cwd = options.rootDir || process.cwd();
  let { type, npmName } = options;
  let framework = "vue";
  let language = "js";

  const go = await checkEmpty(cwd);
  if (!go) process.exit(1);

  /**
   * 不存在type的情况下会进行询问
   */
  if (!options.type) {
    type = await selectType();
  }

  /**
   * 不存在npmName的情况下会进行询问
   */
  if (!options.npmName) {
    const template = await selectTemplate(type);
    npmName = template.npmName;
    framework = template.framework;
    language = template.language;
  }

  await initMaterialAndComponent({
    cwd,
    projectType: type,
    template: npmName,
    templateFramework: framework,
    templateLanguage: language,
  });
};

/**
 * 选择初始项目类型
 */
function selectType() {
  const DEFAULT_TYPE = "material";
  return inquirer
    .prompt({
      type: "list",
      name: "type",
      message: "请选择需要生成的项目类型(type)",
      default: DEFAULT_TYPE,
      choices: [
        {
          name: "物料集项目(material collection)",
          value: "material",
        },
        {
          name: "独立业务组件项目(component)",
          value: "component",
        },
      ],
    })
    .then((answer) => answer.type);
}
/**
 * 选择模板
 */
function selectTemplate(type) {
  // 针对不同 init 类型的内置模板
  const typeToTemplates = {
    material: [
      {
        npmName: "@icedesign/ice-react-ts-material-template",
        description: "Vue + JavaScript",
        default: true,
        framework: "vue",
        language: "js",
      },
    ],
    component: [
      {
        npmName: "@icedesign/ice-react-ts-material-template",
        description: "Vue + JavaScript",
        default: true,
        framework: "vue",
        language: "js",
      },
    ],
  };
  const templates = typeToTemplates[type];
  const defaultTemplate = templates.find((item) => item.default === true);

  return inquirer
    .prompt({
      type: "list",
      name: "template",
      message: "请选择项目模板(template)",
      default: defaultTemplate,
      choices: templates.map((item) => {
        return {
          name: item.description,
          value: item,
        };
      }),
    })
    .then((answer) => answer.template);
}
