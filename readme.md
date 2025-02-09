# Gitlability
A repository management utility designed to perform standard operations across multiple repositories. The following operations are supported:

1. Directed branch merging (upstream\downstream) from a provided set.
2. Release merging (merging from test to master with version tagging).
3. Shifting the version tag to the latest commit in the master branch (including creating it).
4. Checking for changes between two branches.
5. Finding tags that are not on the latest commit in the master branch.
6. Creating a branch.

## Installation

To install this utility:
1. Download the repository.
2. Install dependencies via `npm ci`.
3. Run `npm run make` (for a specific platform build, see [commands](https://stackoverflow.com/a/75480193)).
4. Install the application from the `/out` directory.

## Development
To develop the utility, the following dependencies must be installed:
* [nodejs](https://nodejs.org/en)
* [vite](https://vitejs.dev/guide/)

## Related Links
* [Electron documentation](https://www.electronjs.org/docs/latest/)
* [React documentation](https://ru.legacy.reactjs.org/docs/getting-started.html)
* [Bulma documentation](https://bulma.io/documentation/)
* [Icons used](https://icons.getbootstrap.com/)
