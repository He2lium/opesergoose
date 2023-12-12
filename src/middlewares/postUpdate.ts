import { omitDoc } from '../utils/omitDoc'
import { PostQueryMiddleware } from '../types/middlewares'

export const postUpdate: PostQueryMiddleware = (
  openSearchClient,
  index,
  populates = [],
  forbiddenFields = [],
) =>
  async function (doc, next) {
    if (doc)
      await openSearchClient.index({
        index,
        id: doc.id,
        body: omitDoc(await doc.populate(populates), forbiddenFields),
        refresh: true,
      })

    next()
  }
