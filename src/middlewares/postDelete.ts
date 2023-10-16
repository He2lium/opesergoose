import OpenSearchClient from '../utils/OpenSearchClient'
import { PostQueryMiddleware } from '../types/middlewares'

export const postDelete: PostQueryMiddleware = (index) =>
  async function (doc, next) {
    await OpenSearchClient.instance.delete({
      index,
      id: doc.id,
      refresh: true,
    })

    next()
  }
