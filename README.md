# inlang sdk load-test repo with i18next

This repo can be used for volume testing, with more meesages than existing unit tests.

### test defaults
1. This test generates 1000 messages in English.
2. It then "mock-translates" those into 37 languages using the inlang cli.
3. Lint-rule plugins are configured in the project settings.

### mock rpc server
This test expects the rpc server from PR [#2108](https://github.com/opral/monorepo/pull/2108) running on localhost:3000 with MOCK_TRANSLATION=true

```sh
# in your opral/monorepo
git checkout 1844-sdk-persistence-of-messages-in-project-direcory
pnpm install
pnpm build
MOCK_TRANSLATE=true pnpm --filter @inlang/server dev
```

### install
```sh
git clone https://github.com/opral/load-test.git
cd load-test
pnpm install
```

### run load test
first start the mock rpc server (see above), then
```sh
pnpm test
```

### clean
```sh
pnpm clean
```

### debug in chrome dev tools with node inspector
```sh
pnpm inspect
```
