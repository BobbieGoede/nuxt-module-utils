[![](https://img.shields.io/npm/v/nuxt-module-utils/latest.svg?style=flat&label=npm&colorA=18181B)](https://npmjs.com/package/nuxt-module-utils)
[![](https://img.shields.io/npm/dm/nuxt-module-utils?style=flat&colorA=18181B&color=blue)](https://npmjs.com/package/nuxt-module-utils)

# Nuxt Module Utils

> [!WARNING]
> Work in progress!

A collection of utility functions for Nuxt module authors.

## Installation

```bash
npm i nuxt-module-utils
```

## Usage

### `hoistDependencies(hoist: string[])`

While Nuxt provides the `typescript.hoist` option to generate aliases for nested dependencies within pnpm monorepos, it is processed before modules are set up.

The `hoistDependencies` utility allows you to hoist dependencies from within your module's `setup` function. It works by resolving the paths of the specified packages and adding them to Nuxt's TypeScript configuration, ensuring they are included in the generated `tsconfig.json`.

```ts
// src/module.ts
import { defineNuxtModule } from '@nuxt/kit'
import { hoistDependencies } from 'nuxt-module-utils'

export default defineNuxtModule({
  async setup() {
    await hoistDependencies(['my-lib', 'my-other-lib'])
  }
})
```

## Sponsors

<p align="center">
  <a href="https://raw.githubusercontent.com/bobbiegoede/static/main/sponsors.svg">
    <img src="https://raw.githubusercontent.com/bobbiegoede/static/main/sponsors.svg" />
  </a>
</p>
