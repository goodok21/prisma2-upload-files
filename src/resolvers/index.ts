import { AuthPayload } from './AuthPayload'
import { Mutation } from './Mutation'
import { Post } from './Post'
import { Query } from './Query'
import { User } from './User'
import { File } from './File'
import { Upload } from './Upload'

export const resolvers = {
  Query,
  User,
  Post,
  Mutation,
  AuthPayload,
  File,
  Upload
}
