# Nest Next Renderer

[![npm version](https://img.shields.io/npm/v/nest-next-renderer)](https://www.npmjs.com/package/nest-next-renderer) [![npm downloads/month](https://img.shields.io/npm/dm/nest-next-renderer)](https://www.npmjs.com/package/nest-next-renderer) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Gamote/nest-next-renderer/blob/master/LICENSE)

Module for rendering Next.js pages inside Next.js applications.

> **Note:** At the moment this package works only with Next **and** Fastify.

## Installation

This package requires to be installed in a Next application that is using Fastify as platform ([read more](https://docs.nestjs.com/techniques/performance)).

### Peer dependencies

This is the full list of peer dependencies:

- [Nest](https://nestjs.com/): `yarn add @nestjs/common`
- [Fastify](https://www.fastify.io/): `yarn add fastify`
- [Next](https://nextjs.org/), [React](https://reactjs.org/) and [ReactDOM](https://reactjs.org/): `yarn add react react-dom next`

> **Note:** In theory you should install just `react`, `react-dom` and `next`
because `@nestjs/common` and `fastify` might be already installed.

> **Note:** If you are using TypeScript, you should install `@types/react` and `@types/react-dom` as well.

### Install

Run: `yarn add nest-next-renderer`

## Usage

Import the module:

```typescript
import { Module } from '@nestjs/common';
import { NextRendererModule } from 'nest-next-renderer';

@Module({
  imports: [
    NextRendererModule.forRoot({
      dev: process.env.NODE_ENV !== 'production',
      dir: './client',
      customServer: true,
      conf: {
        // Next.js config
      },
    }),
  ],
})
export class AppModule {}
```

Render from a controller:

```typescript
// WIP
```

# Contributing

You can contribute to this project by opening an issue or creating a pull request.

> **Note:** If you want to test this library locally by using yarn link, you should know that there will be a conflict between the local `@nestjs/common` and `@nestjs/core` packages (devDependencies) and the ones in the test project. To fix this, you'll have to use the same module path in both projects.
