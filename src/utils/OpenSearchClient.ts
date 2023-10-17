import { Client, ClientOptions } from '@opensearch-project/opensearch'

class OpenSearchClient extends Client {
  private static _instance: Client

  // TODO: remove
  private static config: ClientOptions
  constructor(connection?: Client | ClientOptions) {
    if (connection instanceof Client) OpenSearchClient._instance = connection
    else super(connection || OpenSearchClient.config || { node: process.env.OPENSEARCH_HOST })
  }

  public static get instance() {
    if (this._instance) return this._instance
    this._instance = new OpenSearchClient()
    return this._instance
  }

  // TODO: remove
  public static setConfig(config: ClientOptions) {
    this.config = config
  }
}

export default OpenSearchClient
