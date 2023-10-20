import { HydratedDocument } from 'mongoose'
import omitDeep from 'omit-deep'

export const omitDoc = (doc: HydratedDocument<unknown>, forbiddenFields: string[] = []) =>
  omitDeep(doc.toJSON({ virtuals: false }), [
    ...new Set([...forbiddenFields, '_id', '__v']),
  ]) as HydratedDocument<{ _id: never }>
