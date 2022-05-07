import { model } from "mongoose";
import { UserSchema } from "./schema/user";
import { User as UserType  } from "./schema/util";

export const User = model<UserType>('User', UserSchema); 

