export interface GetCommentsRoute {
  Params: {
    slug: string
  }
}

export interface CreateCommentRoute {
  Params: {
    slug: string
  }
  Body: {
    comment: {
      body: string
    }
  }
}

export interface LikeCommentRoute {
  Params: {
    slug: string
    id: string
  }
}

export interface SaveCommentRoute {
  Params: {
    slug: string
    id: string
  }
}

export interface DeleteCommentRoute {
  Params: {
    slug: string
    id: string
  }
}
