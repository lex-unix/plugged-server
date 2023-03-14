import S from 'fluent-json-schema'

export const Profile = S.object()
  .prop('id', S.number().required())
  .prop('username', S.string().required())
  .prop('name', S.string().required())
  .prop('avatar', S.string().required())

const get = {
  response: {
    200: S.object().prop('user', Profile),
    404: S.object().prop('message', S.string())
  }
}
