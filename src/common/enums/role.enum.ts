/**
 * Role enum — matches the real "profiles.role" column, which is a plain
 * TEXT + CHECK column (role IN ('user','admin','moderator')) in the
 * restored schema, not a native Postgres enum type.
 */
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}
