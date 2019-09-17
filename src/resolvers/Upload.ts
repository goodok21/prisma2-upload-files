import { scalarType, arg } from 'nexus'

export const Upload = scalarType({
  name: 'Upload',
  asNexusMethod: 'upload',
  description: 'Upload scalar type',
  // parseValue(value) {
  //   return new Date(value);
  // },
  serialize(value) {
    return value
  }
  // parseLiteral(ast) {
  //   if (ast.kind === Kind.INT) {
  //     return new Date(ast.value);
  //   }
  //   return null;
  // },
})
