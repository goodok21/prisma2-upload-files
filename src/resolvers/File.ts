import { objectType } from 'nexus'
// import { GraphQLUpload } from 'graphql-upload'

export const File = objectType({
  name: 'File',
  definition(t) {
    t.model.id()
    t.model.path()
    t.model.size()
    t.model.mimetype()
  },
})

// export const Upload = GraphQLUpload