import { Types } from 'mongoose'
import { PostQueryMiddleware, PreQueryMiddleware } from '../types/middlewares'

export const saveInvolvedIds: PreQueryMiddleware = () =>
  async function (next) {
    this.involvedIds = await this.model.find(this.getFilter()).distinct<Types.ObjectId>('_id')
    next()
  }

export const postDeleteMany: PostQueryMiddleware = (OpenSearchClient, index ) =>
  async function (_res, next) {
    if (!this.involvedIds) return

    const body = this.involvedIds.map((id) => ({
      delete: { _index: `${index}`, _id: id.toString() },
    }))

    if (body.length) await OpenSearchClient.bulk({ body })

    next()
  }
