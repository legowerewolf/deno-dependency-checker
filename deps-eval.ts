import { equal } from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { DenoInfoJson } from "./types/DenoInfoJson.ts";

// for Array.filter()
function uniques<T>(elem: T, index: number, list: Array<T>) {
  return list.findIndex((_elem) => equal(elem, _elem)) == index;
}

// Read the dependency graph
const graph: DenoInfoJson = await Deno.run({
  cmd: ["deno", "info", Deno.args[0], "--json", "--unstable"],
  stdout: "piped",
})
  .output()
  .then((output) => JSON.parse(new TextDecoder().decode(output)));

const hostnameMap: {
  [key: string]: (
    arg0: string,
  ) => Promise<
    {
      source: string;
      name: string;
      savedVersion: string;
      currentVersion: string;
    }
  >;
} = {
  "deno.land": async (spec: string) => {
    const regex = /https?:\/\/deno.land\/(?<name>.*)@(?<version>[\d\.]*)/;

    const parsed = spec.match(regex);

    const name = parsed?.groups?.["name"] ?? "";

    const currentVersion = await fetch(`https://deno.land/${name}`).then(
      (resp) => resp.url.match(regex)?.groups?.["version"] ?? "",
    );

    return {
      source: "deno.land",
      name,
      savedVersion: parsed?.groups?.["version"] ?? "",
      currentVersion,
    };
  },
};

const data = await Promise.all(
  graph.modules
    .map((dep) =>
      hostnameMap[new URL(dep.specifier).hostname]?.(dep.specifier)
    ),
).then((data) =>
  data
    .filter((elem) => elem != null)
    .filter((elem) => elem.name != "")
    .filter(uniques)
);

console.table(data);

const errInfo: { [key: string]: Array<unknown> } = {
  outdated: data
    .filter((elem) => elem.currentVersion != "")
    .filter((elem) => elem.currentVersion != elem.savedVersion),
  unset: data.filter((elem) => elem.savedVersion == ""),
  unsupportedHost: graph.modules.map((dep) => new URL(dep.specifier).hostname)
    .filter(uniques).filter((elem) => !(elem in hostnameMap)),
};

for (const key in errInfo) {
  if (errInfo[key].length == 0) delete errInfo[key];
}

if (!equal(errInfo, {})) console.error(errInfo);
