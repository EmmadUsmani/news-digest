import {
  Controller,
  Get,
  Header,
  Inject,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { type PublicPreviewReads } from './previews';

export const PUBLIC_PREVIEWS = Symbol('PUBLIC_PREVIEWS');
export type PublicPreviewsPort = Pick<
  PublicPreviewReads,
  'history' | 'latest' | 'find'
>;

// Not installed: replace legacy reads without exposing costs, jobs or writes.
@Controller('api/admin/digest-previews')
export class PublicPreviewsController {
  constructor(
    @Inject(PUBLIC_PREVIEWS) private readonly reads: PublicPreviewsPort,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  history(@Query('offset') offset = '0') {
    return this.reads.history(offset);
  }

  @Get('latest')
  @Header('Cache-Control', 'no-store')
  latest() {
    return this.reads.latest();
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  find(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.reads.find(id);
  }
}
