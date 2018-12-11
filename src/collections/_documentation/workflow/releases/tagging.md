---
title: Tagging Errors
sidebar_order: 0
release_identifier: "my-project-name@2.3.12"
---

## Tag Your Errors With a Release

Include a release ID (a.k.a version) where you configure your client SDK: 

{% include components/platform_content.html content_dir='set-release' %}

The release value is commonly a git SHA or a custom version number. Note that releases are global per organization, so make sure to prefix them with something project specific if needed. Also, how you make the version available to your code is up to you. (For example, you could use an environment variable that is set during the build process.)

Setting a release value in your SDK configuration lets each error be annotated with a release tag. We recommend that you tell Sentry about a new release prior to deploying it (as this will unlock a few more features - see Step 2), but if you don’t, Sentry will automatically create a release entity in the system the first time it sees an error with that release ID.

After this, you should see information about the release, such as new issues and regressions introduced in the release.

{% asset releases-overview.png %}
