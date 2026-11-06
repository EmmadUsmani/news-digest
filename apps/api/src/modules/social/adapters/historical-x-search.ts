// Historical replay only; never wired into the scheduled worker.
import type { XSearchRequest } from '../domain/x-search.port';
import { DirectXSearch } from './x-search';
import { baseXSearchBody } from './x-search-body';
import { xSearchComparisonBody } from './x-search-comparison';
import { viralXSearchBody } from './x-viral-search-body';

export function xSearchBody(request: XSearchRequest) {
  if (request.fixedSearch) {
    const { style, settings, rankedStoryTitles } = request.fixedSearch;
    if (!['reactions', 'trending'].includes(style))
      throw new Error('Invalid fixed X search style');
    return style === 'trending'
      ? viralXSearchBody(request, settings)
      : xSearchComparisonBody(request, style, settings, rankedStoryTitles);
  }
  return baseXSearchBody(request);
}

export class HistoricalXSearch extends DirectXSearch {
  protected override buildBody(request: XSearchRequest) {
    return xSearchBody(request);
  }
}
