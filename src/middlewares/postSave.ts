import { omitDoc } from '../utils/omitDoc'
import { PostSaveMiddleware } from '../types/middlewares'

export const postSave: PostSaveMiddleware = (openSearchClient, index, populates = [], forbiddenFields = []) =>
  async function (_doc, next) {
    await openSearchClient.index({
      index,
      id: this.id,
      body: omitDoc(await this.populate(populates), forbiddenFields),
      refresh: true,
    })

    next()
  }
