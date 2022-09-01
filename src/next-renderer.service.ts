import { Inject, Injectable } from '@nestjs/common';
import { NextServer } from 'next/dist/server/next';
import next from 'next';
import { BaseNextRequest, BaseNextResponse } from 'next/dist/server/base-http';
import { IncomingMessage, ServerResponse } from 'http';
import { NextRendererOptions } from './next-renderer.interfaces';
import { NEXT_RENDERER_OPTIONS } from './next-renderer.constants';

@Injectable()
export class NextRendererService {
  private nextServer: NextServer;

  constructor(
    @Inject(NEXT_RENDERER_OPTIONS) private options: NextRendererOptions,
  ) {}

  /**
   * Start the Next server on module initialization
   */
  async onModuleInit(): Promise<void> {
    try {
      this.nextServer = next({
        ...this.options,
      });

      await this.nextServer.prepare();
    } catch (error) {
      // TODO: improve error handling
      console.log(error);
    }
  }

  getNextServer(): NextServer {
    return this.nextServer;
  }

  // TODO: replace with filter
  // https://github.com/kyle-mccarthy/nest-next/blob/156b4b5cd00951b898e5c4c647337ce32bae75f5/lib/render.filter.ts#L51
  render<Props>(
    req: BaseNextRequest | IncomingMessage,
    res: ServerResponse | BaseNextResponse,
    pathname: string,
    props: Props,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.nextServer.render(req, res, pathname, { props: props ?? {} });
  }
}
