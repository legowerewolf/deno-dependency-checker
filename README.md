# deno-dependency-checker

Tool for checking dependency versions for Deno programs

## Warnings

- Only guaranteed to work for `deno.land/std` and `deno.land/x/` dependencies.
  Uses redirect behavior to get current dependency versions.

- Uses unstable `deno info --json` to get dependency info in a readable format.
  Automated status checks against stable and nightly are forthcoming.

## Usage

```sh
> deno run --allow-net --allow-run deps-eval.ts [your script here]
```
