import { HydratedDocument, Types } from 'mongoose'
import omitDeep from 'omit-deep'

export const omitDoc = (doc: HydratedDocument<unknown>, forbiddenFields: string[] = []) =>
  omitDeep(doc.toJSON({ virtuals: true }), [
    ...new Set([...forbiddenFields, 'id', '_id', '__v']),
  ]) as HydratedDocument<{ _id: never }>
