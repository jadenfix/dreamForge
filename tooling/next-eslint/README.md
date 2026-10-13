# Next lint rules with native root discovery

This is a transparent local maintenance fork of the MIT-licensed `@next/eslint-plugin-next@15.5.27` distributed `dist/` sources. It retains all 21 upstream rules, recommended and core-web-vitals configurations, diagnostics and severity. `LICENSE.md` is the matching Next.js license. `upstream-sha256.json` records the upstream files for review.

Only `utils/get-root-dirs.js` changes: its `fast-glob` adapter is replaced by Node's `fs.globSync`, then filters for directories. Next's plugin still uses fast-glob in version 16.4.0, retaining micromatch → braces, whose current published 3.0.3 has an unpatched advisory. This replacement removes that vulnerable implementation, rather than hiding it from an audit. There are no scanner exclusions or package aliases. All other distributed files are byte-for-byte identical to the upstream release.

The project uses the default root directory. Literal, star, recursive, brace, explicit hidden, missing-directory and array fixtures are tested; six single-pattern results were compared against the original fast-glob implementation locally. The Node 22.17+ native glob interface is required. Other unusual glob patterns or symlink layouts require additional parity checks before adopting them.

`npm run test:tooling` checks root discovery and retained configurations, executes negative fixtures through the real modern ESLint engine, and checks actual NYC YAML-loader compatibility. ESLint 10 is current upstream maintenance. `@eslint/compat` adapts legacy React/Next/import rule context APIs; explicit peer overrides select the tested modern engine without disabling peer checks globally or disabling any rules. All 123 prior effective rule settings are preserved, with five deprecated style rules mapped to maintained `@stylistic` equivalents.

When updating framework rules, compare the next upstream source release and its dependency tree, retain this license, update hashes and regression fixtures, and run the complete lint, test, build, browser and audit commands. This fork is project-maintained; it does not claim to be a patched release from Vercel.
