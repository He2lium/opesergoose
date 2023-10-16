import { Model } from 'mongoose'

export interface OpeserModelType<EntityType> extends Model<EntityType> {
  opeserIntegrity: () => Promise<boolean>
}
