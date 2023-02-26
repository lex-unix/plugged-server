CREATE TABLE IF NOT EXISTS UserAccount (
  id       SERIAL,
  username VARCHAR(64) NOT NULL,
  password VARCHAR(256) NOT NULL
);

ALTER TABLE UserAccount ADD CONSTRAINT pk_UserAccount PRIMARY KEY (id);

CREATE UNIQUE INDEX idx_UserAccountUsername ON UserAccount (username);

CREATE TABLE IF NOT EXISTS Post (
  id     SERIAL,
  title  VARCHAR(250) NOT NULL,
  body   TEXT NOT NULL,
  userId INTEGER NOT NULL
);

ALTER TABLE Post ADD CONSTRAINT pk_Post PRIMARY KEY (id);
ALTER TABLE Post ADD CONSTRAINT fk_PostUserId FOREIGN KEY (userId) REFERENCES UserAccount (id);

CREATE TABLE IF NOT EXISTS PostLike (
  userId INTEGER NOT NULL,
  postId INTEGER NOT NULL
);

ALTER TABLE PostLike ADD CONSTRAINT fk_PostLikeUserId FOREIGN KEY (userId) REFERENCES UserAccount (id);
ALTER TABLE PostLike ADD CONSTRAINT fk_PostLikePostId FOREIGN KEY (postId) REFERENCES Post (id);
