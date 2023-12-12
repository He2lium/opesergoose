import { IndicesIndexSettings, MappingProperty } from '@opensearch-project/opensearch/api/types'
import { PopulateOptions } from 'mongoose'

export namespace OpeserOptions {
  export type OpeserMapProperties<DocumentType> = Record<keyof DocumentType, MappingProperty>
  export interface PluginOptions<DocumentType> {
    index: string
    mapProperties?: OpeserMapProperties<DocumentType>
    populations?: PopulateOptions[]
    forbiddenFields?: string[]
    settings?: IndicesIndexSettings
  }
}
