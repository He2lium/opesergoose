import { Client, ClientOptions } from '@opensearch-project/opensearch'

class OpenSearchClient extends Client {
  private static _instance: Client
  private static config: ClientOptions
  constructor() {
    super(OpenSearchClient.config ?? { node: process.env.OPENSEARCH_HOST })
  }

  public static get instance() {
    if (this._instance) return this._instance
    this._instance = new OpenSearchClient()
    return this._instance
  }

  public static setConfig(config: ClientOptions) {
    this.config = config
  }
}

export default OpenSearchClient
