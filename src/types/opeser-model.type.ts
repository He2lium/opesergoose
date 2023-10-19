import {Model} from "mongoose";

export interface OpeserStatic  {
    opeserIntegrity():Promise<void>
}