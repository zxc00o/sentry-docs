---
title: Link a Repository and Associate Commits
sidebar_title: Repos and Commits
sidebar_order: 1
---

In this step you tell Sentry which commits are associated with a release, allowing Sentry to pinpoint which commits likely caused an issue, and allowing you to resolve a Sentry issue by including the issue number in your commit message.

This is a 2-step process:

1. [Link the repo to your org](#link-repo) - this only needs to be done once
2. [Associate the relevant commits with each release](#associate-commits) - this needs to be done each time you create a release

#### 1. Link a Repository {#link-repo}

(If you've done this before, skip to [step 2](#associate-commits), as this only needs to be done once.)

First, make sure you've installed the global integration for your source code management tool in Organization Settings > Integrations. You’ll need to be an Owner or Manager of your Sentry organization to do this. Read more about roles in Sentry [here]({%- link _documentation/accounts/membership.md -%}).

Once you are in Organization Settings > Integrations and have installed the integration, click the 'Configure' button next to your instance.

In the 'Repositories' panel, click 'Add Repository', and add any repositories from which you'd like to track commits. This creates a webhook on the repository which sends Sentry metadata about each commit (such as authors and files changed).

{% capture __alert_content -%}
If you’re linking a GitHub repository, ensure you have Admin or Owner permissions on the repository, and that Sentry is an authorized GitHub app in your [GitHub account settings](https://github.com/settings/applications).

If you’re having trouble adding it, you can try to [disconnect](https://sentry.io/account/settings/identities/) and then [reconnect](https://sentry.io/account/settings/social/associate/github/) your GitHub identity.
{%- endcapture -%}
{%- include components/alert.html
  title="Note"
  content=__alert_content
%}

#### 2. Associate Commits with a Release {#associate-commits}

In your release process, add a step to create a release object in Sentry and associate it with commits in your repository. There are 2 ways of doing this:

1.  Using Sentry’s [Command Line Interface](#cli) (**recommended**)
2.  Using the [API](#api)

##### Using the CLI {#cli}

```bash
# Assumes you're in a git repository
export SENTRY_AUTH_TOKEN=...
export SENTRY_ORG=my-org
VERSION=$(sentry-cli releases propose-version)

# Create a release
sentry-cli releases new -p project1 -p project2 $VERSION

# Associate commits with the release
sentry-cli releases set-commits --auto $VERSION
```

**Note:** You need to make sure you’re using [Auth Tokens]({%- link _documentation/api/auth.md -%}#auth-tokens) (**not** [API Keys]({%- link _documentation/api/auth.md -%}#api-keys), which are deprecated). You can find your Auth Tokens [here](https://sentry.io/settings/account/api/auth-tokens/).

In the above example, we’re using the `propose-version` sub-command to automatically determine a release ID. Then we’re creating a release tagged `VERSION` for the organization `my-org` for projects `project1` and `project2`. Finally we’re using the `--auto` flag to automatically determine the repository name, and associate the commits between the previous release’s commit and the current head commit with the `VERSION` release. (The first time you associate commits, we use the latest 10 commits.)

If you want more control over which commits to associate, or are unable to execute the command inside the repository, you can manually specify a repository and range. In this case, you'd replace the last line above with:

`sentry-cli releases set-commits --commit "my-repo@from..to" $VERSION`

Here we are associating commits (or refs) between `from` and `to` with the current release, `from` being the previous release’s head commit. The repository name `my-repo` should match the name you entered when linking the repo in [the previous step](#link-repo), and is of the form `owner-name/repo-name`. The `from` commit is optional and we’ll use the previous release’s head commit as the baseline if it is excluded.

For more information, see the [CLI docs]({%- link _documentation/cli/releases.md -%}).

##### Using the API {#api}

```bash
# Create a new release and associate the relevant commits
curl https://sentry.io/api/0/organizations/:organization_slug/releases/ \
  -X POST \
  -H 'Authorization: Bearer {TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '
 {
 "version": "2da95dfb052f477380608d59d32b4ab9",
 "refs": [{
 "repository":"owner-name/repo-name",
 "commit":"2da95dfb052f477380608d59d32b4ab9",
 "previousCommit":"1e6223108647a7bfc040ef0ca5c92f68ff0dd993"
 }],
 "projects":["my-project","my-other-project"]
}
'
```

**Note:** We changed releases to be an org-level entity instead of a project-level entity, so if you are attempting to add commits to a pre-existing releases configuration that uses the project releases endpoint, you will need to change the url.

If you’d like to have more control over what order the commits appear in, you can send us a list of all commits. That might look like this:

```python
import subprocess
import requests

SENTRY_API_TOKEN = <my_api_token>
sha_of_previous_release = <previous_sha>

log = subprocess.Popen([
    'git',
    '--no-pager',
    'log',
    '--no-merges',
    '--no-color',
    '--pretty=%H',
    '%s..HEAD' % (sha_of_previous_release,),
], stdout=subprocess.PIPE)

commits = log.stdout.read().strip().split('\n')

data = {
    'commits': [{'id': c, 'repository': 'my-repo-name'} for c in commits],
    'version': commits[0],
    'projects': ['my-project', 'my-other-project'],
}

res = requests.post(
    'https://sentry.io/api/0/organizations/my-org/releases/',
    json=data,
    headers={'Authorization': 'Bearer {}'.format(SENTRY_API_TOKEN)},
)
```

For more information, see the [API reference]({%- link _documentation/api/releases/post-organization-releases.md -%}).

#### Results

After you've linked your repo and associated the relevant commits, **suspect commits** and **suggested assignees** will start appearing on the issue page. We determine these by tying together the commits in the release, files touched by those commits, files observed in the stack trace, authors of those files, and [ownership rules]({%- link _documentation/workflow/issue-owners.md -%}).

{% asset suspect-commits-highlighted.png %}

Additionally, you will be able to resolve issues by including the issue ID in your commit message. You can find the issue id at the top of the issue details page, next to the assignee dropdown. For example, a commit message might look like this:

```bash
Prevent empty queries on users

Fixes SENTRY-317
```

When Sentry sees this commit, we’ll reference the commit in the issue, and when you create a release in Sentry we’ll mark the issue as resolved in that release.

**Note:** If you’re using GitHub, you may have a privacy setting enabled which prevents Sentry from identifying the user’s real email address. If you wish to use the suggested owners feature, you’ll need to ensure “Keep my email address private” is unchecked in GitHub’s [account settings](https://github.com/settings/emails).
