# Gitlability
A repository management utility designed to perform standard operations across multiple repositories. The following operations are supported:

1. Directed merge of branches (upstream/downstream) from the predefined set.
2. Release merge (merge from test into master with version tag assignment).
3. Shift of the version tag to the latest commit on the master branch (including tag creation if it doesn't exist).
4. Creation of a new branch.
5. Deletion of a specific branch.
6. Closing a Merge Request by its title.
7. Merging a Merge Request by its title.
8. Checking for differences between two branches.
9. Searching for tags that are not pointing to the latest commit on the main branch.

*All branch-related operations allow extending the predefined branch list with custom branches.*

## Installation

To install this utility:
1. Download the repository.
2. Install dependencies via `npm ci`.
3. Run `npm run make` (for a specific platform build, see [commands](https://stackoverflow.com/a/75480193)).
4. Install the application from the `/out` directory.

## Related Links
* [Electron documentation](https://www.electronjs.org/docs/latest/)
* [React documentation](https://ru.legacy.reactjs.org/docs/getting-started.html)
* [Bulma documentation](https://bulma.io/documentation/)
* [Icons used](https://icons.getbootstrap.com/)
