import { compare, hash } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { idArg, mutationType, stringArg } from 'nexus'
import { APP_SECRET, getUserId } from '../utils'
import { File } from './File'
import { Upload } from './Upload'

import { lookup } from 'mime-types'
import { createWriteStream, unlinkSync, statSync } from 'fs'
import * as mkdirp from 'mkdirp'
import * as cuid from 'cuid'

import * as tf from '@tensorflow/tfjs-node'
import * as sharp from 'sharp'
import { loadImage, createCanvas, Canvas } from 'canvas'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

const uploadDir = './uploads'
mkdirp.sync(uploadDir)

const getCanvas = async (path: string) => {
  const img = await loadImage(path)
  const { width, height } = await sharp(path).metadata()
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  // @ts-ignore
  let imgPixel = tf.browser.fromPixels(canvas)
  return imgPixel
}

const recognizeImage = async (path: string) => {
  // Loading model
  const model = await cocoSsd.load()
  // Creating a canvas
  const canvas = await getCanvas(path)
  // Making prediction
  const predictions = await model.detect(canvas)
  // console.log(predictions);
  model.dispose()
  canvas.dispose()
  return predictions
}

const getFilesizeInBytes = (filename: string) => {
  const stats = statSync(filename)
  const fileSizeInBytes = stats.size
  return fileSizeInBytes
}

const processUpload = async (upload: Promise<any>) => {
  const { createReadStream, filename, mimetype, encoding } = await upload
  const stream = createReadStream()
  return await storeUpload({ stream, filename })
}

const storeUpload = async ({
  stream,
  filename
}: {
  stream: any
  filename: any
}): Promise<any> => {
  const id = cuid()
  const path = `${uploadDir}/${id}-${filename}`
  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on('finish', () => resolve({ id, path }))
      .on('error', reject)
  )
}

const processRemove = async (path: string): Promise<any> => {
  console.log('Removed file: ', path)
  try {
    unlinkSync(path)
    return { result: 'Deleted' }
  } catch (error) {
    return { result: 'Not deleted' }
  }
}

export const Mutation = mutationType({
  definition(t) {
    t.field('singleUpload', {
      type: 'File',
      args: {
        file: Upload
      },
      resolve: async (parent, { file }, ctx) => {
        const { id, path, ...other } = await processUpload(file)
        // console.log(path, file);
        const description = `${JSON.stringify(await recognizeImage(path))}`

        return await ctx.photon.files.create({
          data: {
            id,
            path,
            size: getFilesizeInBytes(path),
            // filename,
            mimetype: `${lookup(path)}`,
            // encoding,
            description
          }
        })
      }
    })

    t.field('deleteFile', {
      type: 'File',
      nullable: true,
      args: { id: idArg() },
      resolve: async (parent, { id }, ctx) => {
        const { path } = await ctx.photon.files.findOne({ where: { id } })
        await processRemove(path)
        return ctx.photon.files.delete({
          where: {
            id
          }
        })
      }
    })

    t.field('signup', {
      type: 'AuthPayload',
      args: {
        name: stringArg({ nullable: true }),
        email: stringArg(),
        password: stringArg()
      },
      resolve: async (parent, { name, email, password }, ctx) => {
        const hashedPassword = await hash(password, 10)
        const user = await ctx.photon.users.create({
          data: {
            name,
            email,
            password: hashedPassword
          }
        })
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user
        }
      }
    })

    t.field('login', {
      type: 'AuthPayload',
      args: {
        email: stringArg(),
        password: stringArg()
      },
      resolve: async (parent, { email, password }, context) => {
        const user = await context.photon.users.findOne({
          where: {
            email
          }
        })
        if (!user) {
          throw new Error(`No user found for email: ${email}`)
        }
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) {
          throw new Error('Invalid password')
        }
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user
        }
      }
    })

    t.field('createDraft', {
      type: 'Post',
      args: {
        title: stringArg(),
        content: stringArg({ nullable: true })
      },
      resolve: (parent, { title, content }, ctx) => {
        const userId = getUserId(ctx)
        return ctx.photon.posts.create({
          data: {
            title,
            content,
            published: false,
            author: { connect: { id: userId } }
          }
        })
      }
    })

    t.field('deletePost', {
      type: 'Post',
      nullable: true,
      args: { id: idArg() },
      resolve: (parent, { id }, ctx) => {
        return ctx.photon.posts.delete({
          where: {
            id
          }
        })
      }
    })

    t.field('publish', {
      type: 'Post',
      nullable: true,
      args: { id: idArg() },
      resolve: (parent, { id }, ctx) => {
        return ctx.photon.posts.update({
          where: { id },
          data: { published: true }
        })
      }
    })
  }
})
