import { HydratedDocument } from 'mongoose'
import { PostQueryMiddleware } from '../types/middlewares'
import { omitDoc } from '../utils/omitDoc'

export const postUpdateMany: PostQueryMiddleware = (openSearchClient, index, populates = [], forbiddenFields = []) =>
  async function (_res, next) {
    if (!this.involvedIds?.length) return

    const documents = (await this.model
      .find({ _id: this.involvedIds })
      .populate(populates)) as HydratedDocument<unknown>[]

    const body = documents.flatMap((document) => {
      const omittedDoc = omitDoc(document, forbiddenFields)
      return [{ index: { _index: `${index}`, _id: document._id.toString() } }, omittedDoc]
    })

    if (body.length) await openSearchClient.bulk({ body })
    next()
  }
