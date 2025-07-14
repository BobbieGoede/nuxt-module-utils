import type { NuxtConfigLayer } from "@nuxt/schema";
import { defu } from "defu";

type GetModuleOptions<T, K extends keyof NuxtConfigLayer["config"]> = [T] extends [never]
  ? NuxtConfigLayer["config"][K]
  : T;

/**
 * Get module options from a given Nuxt layer
 *
 * This takes into account both inline module options specified in the `modules` array
 * and options specified in the layer's config under a specific key.
 *
 * Returns the merged options (keyed config taking precedence) if both are configured, or the first available option.
 *
 * @param layer - a {@link NuxtConfigLayer | Nuxt Layer} from `nuxt.options._layers`
 * @param configKey - the key used to configure module options in nuxt.config
 * @param name - the module name as it would be specified in the `modules` array
 * @returns
 */
export function getLayerModuleOptions<
  T = never,
  K extends keyof NuxtConfigLayer["config"] = keyof NuxtConfigLayer["config"]
>(layer: NuxtConfigLayer, configKey: K, name: string): GetModuleOptions<T, K> | undefined {
  type Options = GetModuleOptions<T, K>;

  const matchInlineOptions = (mod: any): mod is [string, Options] =>
    Array.isArray(mod) && typeof mod[0] === "string" && mod[0] === name;

  const modules = (layer.config.modules || []) as [string, unknown | undefined][];
  const inlineOptions = modules.find(matchInlineOptions)?.[1];
  const keyOptions = layer.config[configKey] as Options | undefined;

  if (inlineOptions == null && keyOptions == null) {
    return undefined;
  }

  return defu(keyOptions || {}, inlineOptions || {}) as Options;
}
