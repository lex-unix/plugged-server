export interface RegisterRoute {
  Body: {
    user: {
      username: string
      password: string
      firstname: string
      lastname: string
      email: string
    }
  }
}

export interface LoginRoute {
  Body: {
    username: string
    password: string
  }
}

export interface UploadRoute {
  Params: {
    id: string
  }
}
