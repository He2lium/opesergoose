import {
  PopulateOptions,
  PostMiddlewareFunction,
  Query,
  HydratedDocument,
  PreMiddlewareFunction,
  Types,
} from 'mongoose'

export type PreQueryMiddleware = (
  index?: string,
  populates?: PopulateOptions[],
  forbiddenFields?: string[]
) => PreMiddlewareFunction<Query<any, any> & { op: string; involvedIds: Types.ObjectId[] }>

export type PostQueryMiddleware = (
  index: string,
  populates?: PopulateOptions[],
  forbiddenFields?: string[]
) => PostMiddlewareFunction<
  Query<any, any> & { op: string; involvedIds?: Types.ObjectId[] },
  HydratedDocument<unknown>
>

export type PostSaveMiddleware = (
  index: string,
  populates?: PopulateOptions[],
  forbiddenFields?: string[]
) => PostMiddlewareFunction<HydratedDocument<unknown>>
