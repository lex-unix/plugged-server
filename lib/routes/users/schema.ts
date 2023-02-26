import S from 'fluent-json-schema'

const User = S.object()
  .prop('id', S.string().required())
  .prop('username', S.string().required())
  .prop('password', S.string().required())

const register = {
  body: S.object()
    .prop('username', S.string().required())
    .prop('password', S.string().required()),
  response: {
    200: S.object().prop('user', User)
  }
}

const login = {
  body: S.object()
    .prop('username', S.string().required())
    .prop('password', S.string().required()),
  response: {
    200: S.object().prop('user', User),
    401: S.object().prop('message', S.string())
  }
}

export const schema = {
  register,
  login
}
