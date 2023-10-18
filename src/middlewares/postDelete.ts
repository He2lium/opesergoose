import { PostQueryMiddleware } from '../types/middlewares'

export const postDelete: PostQueryMiddleware = (openSearchClient,index) =>
  async function (doc, next) {
    await openSearchClient.delete({
      index,
      id: doc.id,
      refresh: true,
    })

    next()
  }
