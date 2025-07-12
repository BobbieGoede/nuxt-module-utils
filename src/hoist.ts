import defu from "defu";
import { type PackageJson, readPackageJSON, resolvePackageJSON } from "pkg-types";
import { resolveModulePath } from "exsolve";
import { dirname } from "pathe";
import { directoryToURL, tryUseNuxt, useNuxt } from "@nuxt/kit";
import { version } from "nuxt/package.json";
const isVersion4 = version.startsWith("4");

/**
 * @see [Nuxt source](https://github.com/nuxt/nuxt/blob/a0f9ddfe241bcf555f6305aa10c087a1fe64af87/packages/nuxt/src/core/utils/types.ts#L6)
 */
async function resolveTypePath(path: string, subpath: string, searchPaths = tryUseNuxt()?.options.modulesDir) {
  try {
    const r = resolveModulePath(path, {
      from: searchPaths?.map((d) => directoryToURL(d)),
      conditions: ["types", "import", "require"],
      extensions: [".js", ".mjs", ".cjs", ".ts", ".mts", ".cts"],
    });
    if (subpath) {
      return r.replace(/(?:\.d)?\.[mc]?[jt]s$/, "");
    }
    const rootPath = await resolvePackageJSON(r);
    return dirname(rootPath);
  } catch {
    return null;
  }
}

/**
 * Hoist dependencies for TypeScript path mapping.
 *
 * This function is a workaround for module authors who need to hoist dependencies
 * for TypeScript path mapping, it mimics the behavior of `nuxt.options.typescript.hoist`
 *
 * @param hoist - An array of package names to hoist.
 * @param nuxt - The Nuxt instance.
 *
 * @see [Nuxt source](https://github.com/nuxt/nuxt/blob/5146bed75eb1a6617e2fb17ea97b3d121cd94930/packages/nuxt/src/core/nuxt.ts#L188-L290)
 */
export async function hoistDependencies(hoist: string[], nuxt = useNuxt()) {
  const packageJSON = await readPackageJSON(nuxt.options.rootDir).catch(() => ({} as PackageJson));
  const NESTED_PKG_RE = /^[^@]+\//;
  const dependencies = new Set([
    ...Object.keys(packageJSON.dependencies || {}),
    ...Object.keys(packageJSON.devDependencies || {}),
  ]);

  const paths = Object.fromEntries(
    await Promise.all(
      hoist.map(async (pkg) => {
        const [_pkg = pkg, _subpath] = NESTED_PKG_RE.test(pkg) ? pkg.split("/") : [pkg];
        const subpath = _subpath ? "/" + _subpath : "";

        // ignore packages that exist in `package.json` as these can be resolved by TypeScript
        if (dependencies?.has(_pkg)) {
          return [];
        }

        const path = await resolveTypePath(_pkg + subpath, subpath, nuxt.options.modulesDir);
        if (path) {
          return [[pkg, [path]]];
        }

        return [];
      })
    ).then((r) => r.flat())
  );

  // Set nitro resolutions for types that might be obscured with shamefully-hoist=false
  nuxt.options.nitro.typescript = defu(nuxt.options.nitro.typescript, {
    tsConfig: { compilerOptions: { paths: { ...paths } } },
  });

  // Add nuxt types
  nuxt.hook("prepare:types", (opts) => {
    // Set Nuxt resolutions for types that might be obscured with shamefully-hoist=false
    opts.tsConfig.compilerOptions = defu(opts.tsConfig.compilerOptions, {
      paths: { ...paths },
    });

    if (isVersion4) {
      opts.nodeTsConfig.compilerOptions = defu(opts.nodeTsConfig.compilerOptions, { paths: { ...paths } });
      opts.sharedTsConfig.compilerOptions = defu(opts.sharedTsConfig.compilerOptions, { paths: { ...paths } });
    }
  });
}
