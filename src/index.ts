import { Model, Schema } from 'mongoose'
import { postDeleteMany, saveInvolvedIds } from './middlewares/deleteMany'
import { postDelete } from './middlewares/postDelete'
import { postSave } from './middlewares/postSave'
import { postUpdate } from './middlewares/postUpdate'
import { postUpdateMany } from './middlewares/updateMany'
import { OpeserOptions } from './types/OpeserOptions'
import PluginOptions = OpeserOptions.PluginOptions
import { Client } from '@opensearch-project/opensearch'
import { OpeserModelType } from './types/OpeserModel.type'
import { OpeserStatic } from './types/opeser-model.type'
import { omitDoc } from './utils/omitDoc'

const OpesergooseFactory =
  (openSearchClient: Client, prefix?: string) =>
  async <DocumentType extends Document>(
    schema: Schema<DocumentType>,
    options: PluginOptions<DocumentType>
  ) => {
    const { mapProperties, index, populations, forbiddenFields } = options

    const indexWithPrefix = `${prefix || process.env['OPENSEARCH_INDEX_PREFIX'] || ''}${index}`

    schema.pre(['updateMany', 'updateOne', 'deleteMany', 'deleteOne'], saveInvolvedIds())

    schema.post(['save'], postSave(openSearchClient, indexWithPrefix, populations, forbiddenFields))
    schema.post(
      ['findOneAndUpdate'],
      postUpdate(openSearchClient, indexWithPrefix, populations, forbiddenFields)
    )

    schema.post(
      ['updateMany', 'updateOne'],
      postUpdateMany(openSearchClient, indexWithPrefix, populations, forbiddenFields)
    )

    schema.post(
      ['findOneAndDelete', 'findOneAndRemove'],
      postDelete(openSearchClient, indexWithPrefix)
    )
    schema.post(['deleteMany', 'deleteOne'], postDeleteMany(openSearchClient, indexWithPrefix))

    schema.static('opeserIntegrity', async function (this: Model<DocumentType>) {
      if (mapProperties) {
        // Get indexes by pattern
        const { body: foundIndexes } = await openSearchClient.indices.get({
          index: `${indexWithPrefix}_*`,
        })

        const createdIndexName = `${indexWithPrefix}_${Date.now()}`

        const syncCollection = async () => {
          const body = []
          let count = 0

          for await (const doc of this.find()) {
            if (populations) doc.populate(populations)
            body.push(
              { index: { _index: createdIndexName, _id: doc.id } },
              omitDoc(doc, forbiddenFields)
            )
            count++
          }

          await openSearchClient.bulk({ body, refresh: true })

          return count
        }

        // Update or create index and mapping
        if (Object.keys(foundIndexes).length) {
          for (const foundIndex in foundIndexes) {
            try {
              // check that the new mapping does not conflict with the previous one
              await openSearchClient.indices.putMapping({
                index: foundIndex,
                body: { properties: mapProperties },
              })

              console.info(`successful ${foundIndex} index re-mapping`)
            } catch (e) {
              // If there is a conflict in mapping, create a new index
              await openSearchClient.indices.create({
                index: createdIndexName,
                body: {
                  aliases: foundIndexes[foundIndex].aliases,
                  mappings: {
                    properties: mapProperties,
                  },
                },
              })

              const count = await syncCollection()

              await openSearchClient.indices.delete({
                index: foundIndex,
              })

              console.info(
                `index [${foundIndex}] was deleted. A new index [${createdIndexName}] was created and ${count} documents were added`
              )
            }
          }
        } else {
          await openSearchClient.indices.create({
            index: createdIndexName,
            body: {
              aliases: {
                [indexWithPrefix]: {},
              },
              mappings: {
                properties: mapProperties,
              },
            },
          })

          const count = await syncCollection()

          console.info(
            `a new index [${createdIndexName}] was created and ${count} documents were added`
          )
        }
      }
    })
  }

export { OpeserOptions, OpeserModelType, OpesergooseFactory, OpeserStatic }
