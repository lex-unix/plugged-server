import S from 'fluent-json-schema'

const User = S.object()
  .prop('id', S.string().required())
  .prop('username', S.string().required())
  .prop('firstname', S.string().required())
  .prop('lastname', S.string().required())
  .prop('email', S.string().required())
  .prop('avatar', S.string())

const register = {
  body: S.object().prop(
    'user',
    S.object()
      .prop('username', S.string().required())
      .prop('password', S.string().required())
      .prop('firstname', S.string().required())
      .prop('lastname', S.string().required())
      .prop('email', S.string().required())
  ),
  response: {
    200: S.object().prop('user', User),
    409: S.object().prop('message', S.string()).prop('field', S.string())
  }
}

const login = {
  body: S.object()
    .prop('username', S.string().required())
    .prop('password', S.string().required()),
  response: {
    200: S.object().prop('user', User),
    '4xx': S.object().prop('message', S.string()).prop('field', S.string())
  }
}

const update = {
  body: S.object().prop(
    'user',
    S.object()
      .prop('username', S.string().required())
      .prop('firstname', S.string().required())
      .prop('lastname', S.string().required())
      .prop('email', S.string().required())
  ),
  response: {
    200: S.object().prop('user', User),
    404: S.object().prop('message', S.string()),
    409: S.object()
      .prop('message', S.string().required())
      .prop('field', S.string().required())
  }
}

const upload = {
  query: S.object().prop('userId', S.string().required()),
  response: {
    201: S.object().prop('message', S.string())
  }
}

export const schema = {
  register,
  login,
  upload,
  update
}
