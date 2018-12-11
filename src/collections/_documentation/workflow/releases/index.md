---
title: Releases
sidebar_order: 0
---

A release is a version of your code that is deployed to an environment. When you give Sentry information about your releases, you unlock a number of new features:

-   Determine the issues and regressions introduced in a new release
-   Predict which commit caused an issue and who is likely responsible
-   Resolve Sentry issues by including the issue number in your commit message
-   Receive email notifications when your code gets deployed

Additionally, releases are used for applying [sourcemaps]({%- link _documentation/platforms/javascript/sourcemaps/index.md -%}) to minified JavaScript to view original untransformed source code.

## Configuring Releases

Configuring releases fully is a 3-step process:

1.  [Tag Your Errors With a Release]({%- link _documentation/workflow/releases/tagging.md -%})
2.  [Link a Repository and Associate Commits]({%- link _documentation/workflow/releases/repos-commits.md -%})
3.  [Tell Sentry When You Deploy a Release]({%- link _documentation/workflow/releases/deploying.md -%})

## Release Artifacts

Javascript and iOS projects can use release artifacts to unminify or symbolicate error stack traces. To learn more, please check out our [iOS]({%- link _documentation/clients/cocoa/index.md -%}#sentry-cocoa-debug-symbols) and [JavaScript]({%- link _documentation/platforms/javascript/sourcemaps/index.md -%}) docs.
