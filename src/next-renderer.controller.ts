import { Controller, Get, Res, Req } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { NextRendererService } from './next-renderer.service';

@Controller('/')
export class NextRendererController {
  constructor(private nextRendererService: NextRendererService) {}

  @Get('_next/*')
  @Get('static/*')
  internalPaths(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    // We need to return the response or the request will hang
    return this.nextRendererService.handle(req.raw, res.raw);
  }
}
