import S from 'fluent-json-schema'

const Post = S.object()
  .prop('id', S.string().required())
  .prop('title', S.string().required())
  .prop('body', S.string().required())
  .prop('username', S.string().required())
  .prop('likes', S.string().required())

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
  )
}

export const schema = {
  getPosts,
  getPost,
  insert
}
