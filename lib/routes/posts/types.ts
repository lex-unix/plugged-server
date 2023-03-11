export interface GetPostRoute {
  Params: {
    id: string
  }
}

export interface CreatePostRoute {
  Body: {
    post: {
      title: string
      body: string
    }
  }
}

export interface DeletePostRoute {
  Params: {
    id: string
  }
}

export interface LikePostRoute {
  Params: {
    id: string
  }
}

export interface SavePostRoute {
  Params: {
    id: string
  }
}
