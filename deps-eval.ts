import { equal } from "https://deno.land/std@0.95.0/testing/asserts.ts";

interface DenoDepsInfo {
  root: string;
  modules: [
    {
      specifier: string;
      dependencies: [
        {
          specifier: string;
          isDynamic: boolean;
          code: string;
        },
      ];
      size: number;
      mediaType: "TypeScript" | string;
      local: string;
      checksum: string;
      emit: string;
    },
  ];
}

const nameVerRegex = /https?:\/\/(?<name>.*)@(?<version>[\d\.]*)/;

const graph: DenoDepsInfo = await Deno.run({
  cmd: ["deno", "info", Deno.args[0], "--json", "--unstable"],
  stdout: "piped",
})
  .output()
  .then((output) => JSON.parse(new TextDecoder().decode(output)));

const data = await Promise.all(
  graph.modules
    .map((dep) => {
      const parsed = dep.specifier.match(nameVerRegex);

      return {
        name: parsed?.groups?.["name"] ?? "",
        savedVersion: parsed?.groups?.["version"] ?? "",
      };
    })
    .filter(
      (elem, index, list) =>
        list.findIndex((felem) => equal(elem, felem)) == index,
    )
    .filter((elem) => elem.name != "")
    .map(async (elem) => {
      return {
        ...elem,
        currentVersion: await fetch("https://" + elem.name).then(
          (resp) => resp.url.match(nameVerRegex)?.groups?.["version"],
        ),
      };
    }),
);

console.table(data);

const outdated = data
  .filter((elem) => [undefined, ""].indexOf(elem.currentVersion) == -1)
  .filter((elem) => elem.currentVersion != elem.savedVersion);

if (outdated.length > 0) console.error(JSON.stringify(outdated));
