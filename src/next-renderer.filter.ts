import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { NextRendererModule } from './next-renderer.module';
import { NextRendererService } from './next-renderer.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { parse as parseUrl } from 'url';
import { ErrorPassThroughLevel } from './next-renderer.types';

@Catch()
export class NextRendererFilter implements OnModuleInit, ExceptionFilter {
  constructor(private readonly nextRendererService: NextRendererService) {}

  onModuleInit() {
    Logger.log(
      `${NextRendererFilter.name} was initialized.`,
      NextRendererModule.name,
    );
  }

  /**
   * Nest isn't aware of how Next handles routing for the build assets (static, images etc.),
   * let Next handle routing for any request that isn't handled by a controller
   *
   * @param error
   * @param host
   */
  async catch(
    error: Error & { status?: number },
    host: ArgumentsHost,
  ): Promise<unknown> {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<FastifyRequest>();
    const res = ctx.getResponse<FastifyReply>();

    // If the request and/or response are `undefined` (as with GraphQL) rethrow the error
    if (!req || !res) {
      throw error;
    }

    // If the request can't be handled don't do anything
    if (res.raw.headersSent || !req.raw.url) {
      return;
    }

    // Let next handle the error
    // It's possible that the error or response doesn't contain a status code
    // if this is the case treat it as an internal server error
    res.statusCode =
      error && error.status
        ? error.status
        : res.statusCode ??
          res.raw.statusCode ??
          HttpStatus.INTERNAL_SERVER_ERROR;

    const { pathname, query } = parseUrl(req.url, true);

    // Check if the consumer wants to handle the error
    if (this.nextRendererService.options.errorHandler) {
      await this.nextRendererService.options.errorHandler(
        error,
        req,
        res,
        pathname,
        query,
      );
    }

    // Check if the response was already sent (e.g. by the consumer's error handler)
    if (res.sent === true || res.raw.headersSent) {
      return;
    }

    // If the consumer wants to let Next handle the 404 errors
    if (
      res.statusCode === HttpStatus.NOT_FOUND &&
      (this.nextRendererService.options.errorPassThrough ===
        ErrorPassThroughLevel.ALL ||
        this.nextRendererService.options.errorPassThrough ===
          ErrorPassThroughLevel.NOT_FOUND)
    ) {
      // Halt the execution of the normal request lifecycle in order to send the response manually
      res.hijack();

      return this.nextRendererService.handle(req.raw, res.raw);
    }

    // If the consumer wants to let Next render errors
    if (
      this.nextRendererService.options.errorPassThrough ===
      ErrorPassThroughLevel.ALL
    ) {
      // Halt the execution of the normal request lifecycle in order to send the response manually
      res.hijack();

      return this.nextRendererService.renderError(
        error,
        req.raw,
        res.raw,
        pathname,
        query,
      );
    }

    throw error;
  }
}
