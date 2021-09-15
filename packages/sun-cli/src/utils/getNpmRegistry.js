module.exports = async (
  npmName,
  materialConfig,
  publishConfig,
  enableUseTaobao
) => {
  // 某些场景不能用 taobao 源（generate）
  let registry = enableUseTaobao
    ? "https://registry.npm.taobao.org"
    : "https://registry.npmjs.org";

  if (publishConfig && publishConfig.registry) {
    registry = publishConfig.registry;
  } else if (materialConfig && materialConfig.registry) {
    registry = materialConfig.registry;
  } else {
    const configRegistry = await config.get("registry");
    if (configRegistry) {
      registry = configRegistry;
    }
  }

  log.verbose("getNpmRegistry", registry);
  return registry;
};
