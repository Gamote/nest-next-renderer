import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NextServer } from 'next/dist/server/next';
import next from 'next';
import { BaseNextRequest, BaseNextResponse } from 'next/dist/server/base-http';
import { IncomingMessage, ServerResponse } from 'http';
import { NextRendererOptions } from './next-renderer.interfaces';
import { NEXT_RENDERER_OPTIONS } from './next-renderer.constants';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyInstance } from 'fastify';
import { NextRendererModule } from './next-renderer.module';
import { ParsedUrlQuery } from 'querystring';

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

/**
 * Service that handles the rendering of the Next.js application
 */
@Injectable()
export class NextRendererService implements OnModuleInit {
  private nextServer: NextServer;

  constructor(
    @Inject(NEXT_RENDERER_OPTIONS)
    private readonly _options: NextRendererOptions,
    private readonly adapterHost: HttpAdapterHost,
  ) {}

  /**
   * Start the Next server on module initialization
   */
  async onModuleInit(): Promise<void> {
    // Initialize the Next server
    try {
      this.nextServer = next({
        dev: process.env.NODE_ENV !== 'production',
        customServer: true,
        ...(this._options.nextServerOptions ?? {}),
        conf: {
          // Disabling file-system routing, so we can explicitly handle the routing
          // https://nextjs.org/docs/advanced-features/custom-server#disabling-file-system-routing
          useFileSystemPublicRoutes: false,
          ...(this._options.nextServerOptions?.conf ?? {}),
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

    const nextRender = this.render.bind(this);

    fastifyApp.decorateReply('render', function <
      Props,
    >(view: string, data: Props): Promise<void> {
      return nextRender(this.request.raw, this.raw, view, data);
    });

    Logger.log(
      `${NextRendererService.name} was initialized.`,
      NextRendererModule.name,
    );
  }

  /**
   * Get options passed to the NextRendererModule
   */
  public get options() {
    return this._options;
  }

  /**
   * Get the Next server instance
   */
  public getNextServer(): NextServer {
    return this.nextServer;
  }

  /**
   * Handle a request using the Next server
   * @param req
   * @param res
   */
  public handle(req: IncomingMessage, res: ServerResponse) {
    const handle = this.nextServer.getRequestHandler();

    return handle(req, res);
  }

  /**
   * Remove the leading slash from a path
   * @param path
   * @private
   */
  private removeLeadingSlash(path: string): string {
    return path.replace(/^\/+/, '');
  }

  /**
   * Add the leading slash from a path
   * @param path
   * @private
   */
  private addLeadingSlash(path: string): string {
    return `/${path}`;
  }

  /**
   * Render a view using Next.js
   * @param req
   * @param res
   * @param view
   * @param data
   */
  public render<Props>(
    req: IncomingMessage | BaseNextRequest,
    res: ServerResponse | BaseNextResponse,
    view: string,
    data: Props,
  ): Promise<void> {
    return this.nextServer.render(
      req,
      res,
      this.addLeadingSlash(this.removeLeadingSlash(view)),
      {
        // TODO: give up on using this to pass non query params - and use the req object instead
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        props: data ?? {},
      },
    );
  }

  /**
   * Render an error using Next.js
   * @param error
   * @param req
   * @param res
   * @param pathname
   * @param query
   */
  public renderError<TError extends Error>(
    error: TError,
    req: IncomingMessage | BaseNextRequest,
    res: ServerResponse | BaseNextResponse,
    pathname: string,
    query: ParsedUrlQuery,
  ): Promise<void> {
    return this.nextServer.renderError(
      error,
      req,
      res,
      this.addLeadingSlash(this.removeLeadingSlash(pathname)),
      query,
    );
  }
}
