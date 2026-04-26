import pool from "../config/database";
import { DatabaseError } from "../errors";

/**
 * User record as stored in the `users` table.
 */
export interface User {
  id: string;
  google_sub: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Minimal profile information extracted from a verified Google ID token.
 */
export interface GoogleProfile {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Look up a user by internal id.
 */
export const findUserById = async (id: string): Promise<User | null> => {
  const query = `
    SELECT
      id,
      google_sub,
      email,
      name,
      picture,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
  `;

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw new DatabaseError("Failed to fetch user", { cause: error });
  }
};

/**
 * Look up a user by Google `sub` (stable Google account identifier).
 */
const findUserByGoogleSub = async (
  googleSub: string,
): Promise<User | null> => {
  const query = `
    SELECT
      id,
      google_sub,
      email,
      name,
      picture,
      created_at,
      updated_at
    FROM users
    WHERE google_sub = $1
  `;

  try {
    const result = await pool.query(query, [googleSub]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching user by google_sub:", error);
    throw new DatabaseError("Failed to fetch user", { cause: error });
  }
};

/**
 * Create or update a user based on a Google profile.
 * If a user with the same `google_sub` exists, only missing / changed fields are updated.
 */
export const upsertUserFromGoogleProfile = async (
  profile: GoogleProfile,
): Promise<User> => {
  const existing = await findUserByGoogleSub(profile.sub);

  if (existing) {
    const query = `
      UPDATE users
      SET
        email = COALESCE($2, email),
        name = COALESCE($3, name),
        picture = COALESCE($4, picture)
      WHERE google_sub = $1
      RETURNING id, google_sub, email, name, picture, created_at, updated_at
    `;

    const values = [
      profile.sub,
      profile.email ?? null,
      profile.name ?? null,
      profile.picture ?? null,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating user from Google profile:", error);
      throw new DatabaseError("Failed to update user", { cause: error });
    }
  }

  const query = `
    INSERT INTO users (
      google_sub,
      email,
      name,
      picture
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, google_sub, email, name, picture, created_at, updated_at
  `;

  const values = [
    profile.sub,
    profile.email ?? null,
    profile.name ?? null,
    profile.picture ?? null,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating user from Google profile:", error);
    throw new DatabaseError("Failed to create user", { cause: error });
  }
};
