# Nest Next Renderer

[![npm version](https://img.shields.io/npm/v/nest-next-renderer)](https://www.npmjs.com/package/nest-next-renderer) [![npm downloads/month](https://img.shields.io/npm/dm/nest-next-renderer)](https://www.npmjs.com/package/nest-next-renderer) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Gamote/nest-next-renderer/blob/master/LICENSE)

Module for rendering Next.js pages inside Next.js applications.

> **Note:** At the moment this package works only with Next **and** Fastify.

## Installation

This package requires to be installed in a Next application that is using Fastify as platform ([read more](https://docs.nestjs.com/techniques/performance)).

1. Make sure you have the peer-dependencies installed: `react`, `react-dom` and `next`.

   > **Note:** If you are using TypeScript, you should install `@types/react` and `@types/react-dom` as well.

    <details>
      <summary>ℹ️ Full list of peer dependencies</summary>

      In theory, you should install just `react`, `react-dom` and `next` because the rest of the dependencies should already be installed in your project.

      - [Nest](https://nestjs.com/) packages: `yarn add @nestjs/core @nestjs/common`
      - [Fastify](https://www.fastify.io/): `yarn add fastify`
      - [React](https://reactjs.org/), [ReactDOM](https://reactjs.org/) and [Next](https://nextjs.org/): `yarn add react react-dom next`

    </details>

2. Install `nest-next-renderer` using **yarn**

   `yarn add nest-next-renderer`

   or **npm**

   `npm i nest-next-renderer`

## Usage

Assuming that you have a Next application in the `./client` directory with 2 pages (`Index` and `Login`) here is how you import the `NextRendererModule` module:

```typescript
import { Module } from '@nestjs/common';
import { NextRendererModule } from 'nest-next-renderer';

@Module({
  imports: [
    NextRendererModule.forRoot({
      nextServerOptions: {
        dir: './client',
      },
      /**
       * The level of error pass-through for your application
       * This is useful because Nest doesn't know how to handle Next's routing for assets.
       * So in this case we might want to pass through 404 errors to Next.
       *
       * @default ErrorPassThroughLevel.ALL
       */
      errorPassThrough: ErrorPassThroughLevel.ALL,
    }),
  ],
})
export class AppModule {}
```

Example of a controller:

```typescript
import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { UsersService } from './services/users.service';
import { LoginPageProps } from './shared/LoginPageProps';

@Controller()
export class AuthController {
  constructor(
    private readonly userService: UsersService,
  ) {}

  @Get('index')
  async getIndex(@Res() res: FastifyReply) {
    return res.render('/', undefined);
  }

  @Get('login')
  async getIdentifier(@Res() res: FastifyReply) {
    return res.render<LoginPageProps>('/login', undefined);
  }

  @Post('login')
  async postIdentifier(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res() res: FastifyReply,
  ) {
    try {
      // Validate credentials, set cookies etc.
      return res.redirect(302, '/');
    } catch (e) {
      return res.render<LoginPageProps>('/login', {
        error: e.message,
        username,
        password,
      });
    }
  }
}
```

# Contributing

You can contribute to this project by opening an issue or creating a pull request.

**Note:** If you want to test this library locally by using `yarn link`, you should know that there will be a conflict between the Nest packages used by this project (`@nestjs/common` and `@nestjs/core`) and the ones in your test project. To fix this you have 2 options:
- use the same modules path in both projects by linking the Nest modules too;
- paste the path to your test project's `nest-next-renderer` folder in the `.linked.packages` file and use the `yarn dev` while developing. Example:

    ```
    # .linked.packages
    /path/to/your/project/node_modules/nest-next-renderer
    ```

  Now everytime you change something, the changes will be reflected in your test project.

## TODO(s)

- [ ] Add tests
- [ ] Add documentation and example (document the default values for the `NextRendererModuleOptions`)
- [ ] Add `@Render` decorator
- [ ] Make it work with Express or others
- [ ] Make it possible to render any page without a controller (`useFileSystemPublicRoutes` + `@Get('*')` and `@Post('*')` that calls `next.handle`)
- [ ] Generate enum for the `view` parameter based on the content of the `pages` folder
- [ ] Server not working with hot reload (if it's on the consumer side document the proper configuration)
