import { HydratedDocument } from 'mongoose'
import omitDeep from 'omit-deep'

export const omitDoc = (doc: HydratedDocument<unknown>, forbiddenFields: string[] = []) => {
  // Cut out the _id field at the top level of the document.
  // This is an OpenSearch reserved field.
  const { _id, ...docObject } = doc.toJSON({ virtuals: true })

  return omitDeep(docObject, [...new Set([...forbiddenFields, 'id', '__v'])]) as HydratedDocument<{
    _id: never
  }>
}
