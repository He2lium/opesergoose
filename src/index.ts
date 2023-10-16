import { Model, Schema } from 'mongoose'
import { postDeleteMany, saveInvolvedIds } from './middlewares/deleteMany'
import { postDelete } from './middlewares/postDelete'
import { postSave } from './middlewares/postSave'
import { postUpdate } from './middlewares/postUpdate'
import { postUpdateMany } from './middlewares/updateMany'
import { OpeserOptions } from './types/OpeserOptions'
import OpenSearchClient from './utils/OpenSearchClient'
import PluginOptions = OpeserOptions.PluginOptions
import dotenv from 'dotenv'

dotenv.config()

export const Opesergoose = async <DocumentType>(
  schema: Schema<DocumentType>,
  options: PluginOptions<DocumentType>
) => {
  const { mapProperties, index, populations, forbiddenFields } = options

  const indexWithPrefix = `${process.env['OPENSEARCH_INDEX_PREFIX'] || ''}${index}`

  schema.pre(['updateMany', 'updateOne', 'deleteMany', 'deleteOne'], saveInvolvedIds())

  schema.post(['save'], postSave(indexWithPrefix, populations, forbiddenFields))
  schema.post(['findOneAndUpdate'], postUpdate(indexWithPrefix, populations, forbiddenFields))

  schema.post(
    ['updateMany', 'updateOne'],
    postUpdateMany(indexWithPrefix, populations, forbiddenFields)
  )

  schema.post(['findOneAndDelete', 'findOneAndRemove'], postDelete(indexWithPrefix))
  schema.post(['deleteMany', 'deleteOne'], postDeleteMany(indexWithPrefix))

  schema.static('opeserIntegrity', async function (this: Model<any>) {
    if (mapProperties) {
      // Get indexes by pattern
      const { body: foundIndexes } = await OpenSearchClient.instance.indices.get({
        index: `${indexWithPrefix}_*`,
      })

      const createdIndexName = `${indexWithPrefix}_${Date.now()}`

      // Update or create index and mapping
      if (Object.keys(foundIndexes).length) {
        for (const foundIndex in foundIndexes) {
          try {
            // check that the new mapping does not conflict with the previous one
            await OpenSearchClient.instance.indices.putMapping({
              index: foundIndex,
              body: { properties: mapProperties },
            })

            console.info(`successful ${foundIndex} index re-mapping`)
          } catch (e) {
            // If there is a conflict in mapping, create a new index
            await OpenSearchClient.instance.indices.create({
              index: createdIndexName,
              body: {
                aliases: foundIndexes[foundIndex].aliases,
                mappings: {
                  properties: mapProperties,
                },
              },
            })

            const documents = await this.find()
              .populate(populations || [])
              .lean()

            if (documents.length) {
              const body = documents.flatMap(({ _id, __v, ...body }) => [
                { delete: { _index: foundIndex, _id: String(_id) } },
                { index: { _index: createdIndexName, _id: String(_id) } },
                body,
              ])

              await OpenSearchClient.instance.bulk({ body, refresh: true })
            }

            await OpenSearchClient.instance.indices.delete({
              index: foundIndex,
            })

            console.info(
              `index [${foundIndex}] was deleted. A new index [${createdIndexName}] was created and ${documents.length} documents were added`
            )
          }
        }
      } else {
        await OpenSearchClient.instance.indices.create({
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

        const documents = await this.find()
          .populate(populations || [])
          .lean()

        if (documents.length) {
          const body = documents.flatMap(({ _id, __v, ...rest }) => [
            { index: { _index: createdIndexName, _id: String(_id) } },
            rest,
          ])

          await OpenSearchClient.instance.bulk({ body, refresh: true })
        }

        console.info(
          `a new index [${createdIndexName}] was created and ${documents.length} documents were added`
        )
      }
    }
  })
}
