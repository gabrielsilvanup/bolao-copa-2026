function isImportRelativoSemExtensao(specifier) {
  return (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !specifier.split("/").at(-1).includes(".")
  );
}

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (erro) {
    if (
      erro?.code === "ERR_MODULE_NOT_FOUND" &&
      isImportRelativoSemExtensao(specifier)
    ) {
      return nextResolve(`${specifier}.js`, context);
    }

    throw erro;
  }
}
