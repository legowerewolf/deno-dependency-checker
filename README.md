# deno-dependency-checker

Tool for checking dependency versions for Deno programs

Archived, because [deno-udd](https://github.com/hayd/deno-udd) is a lot more
stable.

## Warnings

- Uses unstable `deno info --json` to get dependency info in a readable format.
  Automated status checks against stable and nightly are forthcoming.

## Supported dependency sources

- deno.land/std
- deno.land/x/\*

## Usage

```sh
> deno run --allow-net --allow-run deps-eval.ts [your script here]
```
