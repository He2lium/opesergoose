import { Client, ClientOptions } from '@opensearch-project/opensearch'

class OpenSearchClient {
  private static _instance: Client
  private static config: ClientOptions = { node: process.env.OPENSEARCH_HOST }

  public static get instance() {
    if (this._instance) return this._instance
    this._instance = new Client(this.config)
    return this._instance
  }

  public static setConfig(connection: Client | ClientOptions) {
    if (connection instanceof Client) OpenSearchClient._instance = connection
    else OpenSearchClient.config = connection
  }
}

export default OpenSearchClient
