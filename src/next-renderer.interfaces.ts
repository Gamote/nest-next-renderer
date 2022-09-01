import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { NextServerOptions } from 'next/dist/server/next';

/**
 * Options for this module
 */
export type NextRendererOptions = NextServerOptions;

/**
 * Interface for classes that want to provide the config for this module
 */
export interface NextRendererOptionsFactory {
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
