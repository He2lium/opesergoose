import OpenSearchClient from '../utils/OpenSearchClient'
import { omitDoc } from '../utils/omitDoc'
import { PostQueryMiddleware } from '../types/middlewares'

export const postUpdate: PostQueryMiddleware = (index, populates = [], forbiddenFields = []) =>
  async function (doc, next) {
    await OpenSearchClient.instance.index({
      index,
      id: doc.id,
      body: omitDoc(await doc.populate(populates), forbiddenFields),
      refresh: true,
    })

    next()
  }
