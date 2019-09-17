import { objectType } from 'nexus'

export const File = objectType({
  name: 'File',
  definition(t) {
    t.model.id()
    t.model.path()
    t.model.size()
    t.model.mimetype()
    t.model.description()
  }
})
