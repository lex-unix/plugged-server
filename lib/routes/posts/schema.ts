import S from 'fluent-json-schema'

export const Profile = S.object()
  .prop('id', S.number().required())
  .prop('username', S.string().required())

const Post = S.object()
  .prop('id', S.string().required())
  .prop('title', S.string().required())
  .prop('body', S.string().required())
  .prop('likes', S.string().required())
  .prop('liked', S.boolean().required())
  .prop('author', Profile)

const getPosts = {
  response: {
    200: S.object().prop('posts', S.array().items(Post).required())
  }
}

const getPost = {
  response: {
    200: S.object().prop('post', Post),
    404: S.object().prop('message', S.string())
  }
}

const insert = {
  body: S.object().prop(
    'post',
    S.object()
      .prop('title', S.string().required())
      .prop('body', S.string().required())
  ),
  response: {
    201: S.object().prop('post', Post)
  }
}

export const schema = {
  getPosts,
  getPost,
  insert
}
