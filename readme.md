# GitlabUtility
Repository management utility is designed to perform typical operations with multiple repositories. Supported operations are

1. Merging branches (upstream\downstream) from pre-defined set.
2. Release (merge from "test" branch into "master" branch and set the tag).
3. Move tag on a "master" branch to latest commit (including creating of tag)
4. Checking difference between 2 branches (pre-defined set)
5. Searching for tags, that were not placed at latest commit on "master" branch

## Installing

To install this utility:
1. Download the repository
2. Install deps via `npm ci`
3. Run `npm run make` (for specific platform build see [commands](https://stackoverflow.com/a/75480193))
4. Install app from `/out` directory

## Using

Unfortunately, there is currently no EN-US version of the user manual. But I think the user interface is easy to understand :)
If you have any questions, please contact me at the email address listed in my profile.

## Related links
* [Electron](https://www.electronjs.org/docs/latest/)
* [React](https://ru.legacy.reactjs.org/docs/getting-started.html)
* [Bulma](https://bulma.io/documentation/)
* [Bootstrap icons](https://icons.getbootstrap.com/)
