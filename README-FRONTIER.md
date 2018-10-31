## How to make a Release

- When the "develop" branch is ready to merge into frontierMaster for a release, make a PR and be sure to squash all the commits into a single commit.
- Create a tag on frontierMaster named `${SemverVersionOfFacebooksRelease}-frontier-${SemverVersionOfFrontiersRelease}`
- Push that newly created tag up to github with `git push origin ${nameOfTagFromAbove}`
- Travis will catch that new tag, and create a tar file of react-scripts and upload it to the corresponding release on github.
