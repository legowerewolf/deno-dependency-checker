export interface DenoInfoJson {
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
