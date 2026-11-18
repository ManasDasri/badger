# badger

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/ManasDasri/badger/badge)](https://scorecard.dev/viewer/?uri=github.com/ManasDasri/badger)

Badges with bite. A builder for custom GitHub README badges: six styles (including a pixel style with a built-in bitmap font), any size, 3,000+ Simple Icons plus custom icons, and live badges from GitHub stats.

Every badge is a URL:

```
https://gitbadger.vercel.app/api/badge?label=player%201&value=ready&style=pixel&icon=badger&size=md
```

Live stats: add `gh=<user>&stat=stars|followers|repos|forks|gists|language|joined|rank`.

## Run locally

```
npm i
vercel dev
```

Set `GITHUB_TOKEN` in the Vercel project to raise the GitHub API limit from 60 to 5,000 requests an hour.
