import { extractXLinks, type HttpPort } from '../../ingestion/public/discovery';

// The shared HTTP port enforces public HTTPS, rate limits, response caps and redirects.
// This records page references only; it does not fetch X or infer post metadata.
export class RiverDiscovery {
  constructor(private readonly http: HttpPort) {}
  async collect(url: string) {
    return extractXLinks(await this.http.get(url));
  }
}
