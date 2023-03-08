CREATE TABLE IF NOT EXISTS UserAccount (
  id        SERIAL,
  username  VARCHAR(64) NOT NULL,
  password  VARCHAR(256) NOT NULL,
  firstname VARCHAR(64) NOT NULL,
  lastname  VARCHAR NOT NULL,
  email     VARCHAR(64) NOT NULL,
  avatar    VARCHAR(256),
  bio       TEXT
);

ALTER TABLE UserAccount ADD CONSTRAINT pk_UserAccount PRIMARY KEY (id);

CREATE UNIQUE INDEX idx_UserAccountUsername ON UserAccount (username);
CREATE UNIQUE INDEX idx_UserAccountEmail ON UserAccount (email);

CREATE TABLE IF NOT EXISTS Post (
  id        SERIAL,
  title     VARCHAR(250) NOT NULL,
  body      TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  userId    INTEGER NOT NULL
);

ALTER TABLE Post ADD CONSTRAINT pk_Post PRIMARY KEY (id);
ALTER TABLE Post ADD CONSTRAINT fk_PostUserId FOREIGN KEY (userId) REFERENCES UserAccount (id);

CREATE TABLE IF NOT EXISTS PostLike (
  userId INTEGER NOT NULL,
  postId INTEGER NOT NULL
);

ALTER TABLE PostLike ADD CONSTRAINT fk_PostLikeUserId FOREIGN KEY (userId) REFERENCES UserAccount (id);
ALTER TABLE PostLike ADD CONSTRAINT fk_PostLikePostId FOREIGN KEY (postId) REFERENCES Post (id);

CREATE TABLE IF NOT EXISTS Comment (
  id        SERIAL,
  body      TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  userId    INTEGER NOT NULL,
  postId    INTEGER NOT NULL
);

ALTER TABLE Comment ADD CONSTRAINT pk_Comment PRIMARY KEY (id);
ALTER TABLE Comment ADD CONSTRAINT fk_CommentUserId FOREIGN KEY (userId) REFERENCES UserAccount (id);
ALTER TABLE Comment ADD CONSTRAINT fk_CommentPostId FOREIGN KEY (postId) REFERENCES Post (id);

CREATE TABLE IF NOT EXISTS SavedPost (
  userId INTEGER NOT NULL,
  postId INTEGER NOT NULL
);

ALTER TABLE SavedPost ADD CONSTRAINT fk_SavePostUserId FOREIGN KEY (userId) REFERENCES UserAccount (id);
ALTER TABLE SavedPost ADD CONSTRAINT fk_SavePostPostId FOREIGN KEY (postId) REFERENCES Post (id);
