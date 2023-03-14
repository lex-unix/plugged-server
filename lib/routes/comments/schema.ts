import S from 'fluent-json-schema'
import { Profile } from '../profiles/schema'

const Comment = S.object()
  .prop('id', S.number().required())
  .prop('body', S.string())
  .prop('createdAt', S.string().required())
  .prop('likes', S.number().required())
  .prop('liked', S.boolean().required())
  .prop('saved', S.boolean().required())
  .prop('author', Profile)

const get = {
  response: {
    200: S.object().prop('comments', S.array().items(Comment).required())
  }
}

const insert = {
  body: S.object().prop(
    'comment',
    S.object().prop('body', S.string().required())
  ),
  resonse: {
    201: S.object().prop('comment', Comment)
  }
}

export const schema = {
  get,
  insert
}
