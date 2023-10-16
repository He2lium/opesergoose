import OpenSearchClient from '../utils/OpenSearchClient'
import { omitDoc } from '../utils/omitDoc'
import { PostSaveMiddleware } from '../types/middlewares'

export const postSave: PostSaveMiddleware = (index, populates = [], forbiddenFields = []) =>
  async function (_doc, next) {
    await OpenSearchClient.instance.index({
      index,
      id: this.id,
      body: omitDoc(await this.populate(populates), forbiddenFields),
      refresh: true,
    })

    next()
  }
