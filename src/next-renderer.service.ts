import { Inject, Injectable, Logger } from '@nestjs/common';
import { NextServer } from 'next/dist/server/next';
import next from 'next';
import { BaseNextRequest, BaseNextResponse } from 'next/dist/server/base-http';
import { IncomingMessage, ServerResponse } from 'http';
import { NextRendererOptions } from './next-renderer.interfaces';
import { NEXT_RENDERER_OPTIONS } from './next-renderer.constants';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyInstance } from 'fastify';
import { NextRendererModule } from './next-renderer.module';

/**
 * Declare the extra types added by the Fastify plugin.
 */
declare module 'fastify' {
  interface FastifyReply {
    /**
     * Render a view using Next.js
     * @name render
     * @param view
     * @param data
     */
    render<Props>(view: string, data: Props): Promise<void>;
  }
}

@Injectable()
export class NextRendererService {
  private nextServer: NextServer;

  constructor(
    @Inject(NEXT_RENDERER_OPTIONS)
    private readonly options: NextRendererOptions,
    private readonly adapterHost: HttpAdapterHost,
  ) {}

  /**
   * Start the Next server on module initialization
   */
  async onModuleInit(): Promise<void> {
    // Initialize the Next server
    try {
      this.nextServer = next({
        customServer: true,
        ...this.options,
        conf: {
          // Disabling file-system routing, so we can explicitly handle the routing
          // https://nextjs.org/docs/advanced-features/custom-server#disabling-file-system-routing
          useFileSystemPublicRoutes: false,
          ...this.options.conf,
        },
      });

      await this.nextServer.prepare();
    } catch (error) {
      // TODO: do we need to improve error handling?
      Logger.error(
        "Couldn't start the Next server",
        error,
        NextRendererModule.name,
      );
      throw error;
    }

    // Add the render method to the Fastify reply object
    const fastifyApp =
      this.adapterHost.httpAdapter.getInstance() as FastifyInstance;

    const nextRender = this.nextServer.render.bind(this.nextServer);

    fastifyApp.decorateReply('render', function <
      Props,
    >(view: string, data: Props): Promise<void> {
      return nextRender(this.request.raw, this.raw, view, {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        props: data ?? {},
      });
    });

    Logger.log('NextRendererService was initialized.', NextRendererModule.name);
  }

  //
  getNextServer(): NextServer {
    return this.nextServer;
  }

  // TODO: replace with filter
  // https://github.com/kyle-mccarthy/nest-next/blob/156b4b5cd00951b898e5c4c647337ce32bae75f5/lib/render.filter.ts#L51
  render<Props>(
    req: BaseNextRequest | IncomingMessage,
    res: ServerResponse | BaseNextResponse,
    view: string,
    data: Props,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.nextServer.render(req, res, view, { props: data ?? {} });
  }
}
