# degitc — straightforward project scaffolding

![npm package version](https://badgen.net/npm/v/degitc?t=123)
[![Known Vulnerabilities](https://snyk.io/test/npm/degitc/badge.svg)](https://snyk.io/test/npm/degitc)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> Base on [Rich-Harris/degit](https://github.com/Rich-Harris/degit) v2.8.4
> - fix: remove `.git` error on windows
> - fix: `--help` no such file `help.md`
> - feat: add `--proxy` cli option
> - feat: add default [GitHub Proxy](https://mirror.ghproxy.com/) for CN user. Use `--no-ghp` to disable, if you don't need

**degitc** makes copies of git repositories. When you run `degitc some-user/some-repo`, it will find the latest commit on https://github.com/some-user/some-repo and download the associated tar file to `~/.degitc/some-user/some-repo/commithash.tar.gz` if it doesn't already exist locally. (This is much quicker than using `git clone`, because you're not downloading the entire git history.)

## Installation

```bash
pnpm add -g degitc
```

## Usage

### Basics

The simplest use of degitc is to download the master branch of a repo from GitHub to the current working directory:

```bash
degitc user/repo

# these commands are equivalent
degitc github:user/repo
degitc git@github.com:user/repo
degitc https://github.com/user/repo
```

Or you can download from GitLab and BitBucket:

```bash
# download from GitLab
degitc gitlab:user/repo
degitc git@gitlab.com:user/repo
degitc https://gitlab.com/user/repo

# download from BitBucket
degitc bitbucket:user/repo
degitc git@bitbucket.org:user/repo
degitc https://bitbucket.org/user/repo

# download from Sourcehut
degitc git.sr.ht/user/repo
degitc git@git.sr.ht:user/repo
degitc https://git.sr.ht/user/repo
```

### Specify a tag, branch or commit

The default branch is `master`.

```bash
degitc user/repo#dev       # branch
degitc user/repo#v1.2.3    # release tag
degitc user/repo#1234abcd  # commit hash
````

### Create a new folder for the project

If the second argument is omitted, the repo will be cloned to the current directory.

```bash
degitc user/repo my-new-project
```

### Specify a subdirectory

To clone a specific subdirectory instead of the entire repo, just add it to the argument:

```bash
degitc user/repo/subdirectory
```

### Private repositories

Private repos can be cloned by specifying `--mode=git` (the default is `tar`). In this mode, degitc will use `git` under the hood. It's much slower than fetching a tarball, which is why it's not the default.

Note: this clones over SSH, not HTTPS.

### See all options

```bash
degitc --help
```

## Not supported

- Private repositories

Pull requests are very welcome!

## Wait, isn't this just `git clone --depth 1`?

A few salient differences:

- If you `git clone`, you get a `.git` folder that pertains to the project template, rather than your project. You can easily forget to re-init the repository, and end up confusing yourself
- Caching and offline support (if you already have a `.tar.gz` file for a specific commit, you don't need to fetch it again).
- Less to type (`degitc user/repo` instead of `git clone --depth 1 git@github.com:user/repo`)
- Composability via [actions](#actions)
- [Interactive mode](https://github.com/Rich-Harris/degitc/issues/4), [friendly onboarding and postinstall scripts](https://github.com/Rich-Harris/degitc/issues/6)

## JavaScript API

You can also use degitc inside a Node script:

```js
const degitc = require('degitc');

const emitter = degitc('user/repo', {
  cache: true,
  force: true,
  verbose: true,
});

emitter.on('info', info => {
  console.log(info.message);
});

emitter.clone('path/to/dest').then(() => {
  console.log('done');
});
```

## Actions

You can manipulate repositories after they have been cloned with _actions_, specified in a `degit.json` file that lives at the top level of the working directory. Currently, there are two actions — `clone` and `remove`. Additional actions may be added in future.

### clone

```json
// degit.json
[
  {
    "action": "clone",
    "src": "user/another-repo"
  }
]
```

This will clone `user/another-repo`, preserving the contents of the existing working directory. This allows you to, say, add a new README.md or starter file to a repo that you do not control. The cloned repo can contain its own `degit.json` actions.

### remove

```json
// degit.json
[
  {
    "action": "remove",
    "files": ["LICENSE"]
  }
]
```

Remove a file at the specified path.

## See also

- [zel](https://github.com/vutran/zel) by [Vu Tran](https://twitter.com/tranvu)
- [gittar](https://github.com/lukeed/gittar) by [Luke Edwards](https://twitter.com/lukeed05)

## License

[MIT](LICENSE.md).
