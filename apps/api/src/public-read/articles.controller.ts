import { Controller, Get, Header, Inject } from '@nestjs/common';

import { readPublicArticleResponse } from './articles';

export const PUBLIC_ARTICLES = Symbol('PUBLIC_ARTICLES');
export interface PublicArticlesPort {
  read(): Promise<unknown>;
}

// Public-mode transport exposes only the audited origin projection.
@Controller('api/admin/content')
export class PublicArticlesController {
  constructor(
    @Inject(PUBLIC_ARTICLES) private readonly articles: PublicArticlesPort,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  read() {
    return readPublicArticleResponse(() => this.articles.read());
  }
}
