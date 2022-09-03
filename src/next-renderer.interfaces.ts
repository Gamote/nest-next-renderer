import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { NextServerOptions } from 'next/dist/server/next';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ParsedUrlQuery } from 'querystring';
import { ErrorPassThroughLevel } from './next-renderer.types';

/**
 * Options for this module
 */
export type NextRendererOptions = {
  /**
   * Options for the Next.js server
   *
   * @default {
   *   dev: process.env.NODE_ENV !== 'production',
   *   customServer: true,
   *   conf: {
   *     useFileSystemPublicRoutes: false,
   *   }
   * }
   */
  nextServerOptions?: NextServerOptions;
  /**
   * The level of error pass-through for your application
   * This is useful because Nest doesn't know how to handle Next's routing for assets.
   * So in this case we might want to pass through 404 errors to Next.
   *
   * @default PassThroughErrorType.ALL
   */
  errorPassThrough?: ErrorPassThroughLevel;
  /**
   * If defined, the module will use this function to handle errors before passing them to Nest.js or Next.js
   *
   * If a response is sent, the error will not be passed to Nest.js or Next.js.
   * If a response is not sent, the error will be passed to Nest.js or Next.js based on the `errorPassThrough` option.
   *
   * @default undefined
   * @param error
   * @param req
   * @param res
   */
  errorHandler?: (
    error: Error & { status?: number },
    req: FastifyRequest,
    res: FastifyReply,
    pathname: string,
    query: ParsedUrlQuery,
  ) => Promise<void>;
};

/**
 * Interface for classes that want to provide the config for this module
 */
export interface NextRendererOptionsFactory {
  /**
   * Method that returns the config for this module
   */
  createOptions(): Promise<NextRendererOptions> | NextRendererOptions;
}

/**
 * Type of the options that are available to be passed to this module
 */
export interface NextRendererAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: FactoryProvider['inject'];
  useFactory?: (
    ...args: unknown[]
  ) => Promise<NextRendererOptions> | NextRendererOptions;
  useExisting?: Type<NextRendererOptionsFactory>;
  useClass?: Type<NextRendererOptionsFactory>;
}
