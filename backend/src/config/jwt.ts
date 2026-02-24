import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

const jwtSecret: jwt.Secret = process.env.JWT_SECRET || "change_me";
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ||
  "24h") as jwt.SignOptions["expiresIn"];

const signAccessToken = (userId: string, role: Role): string => {
  const options: jwt.SignOptions = {
    subject: userId,
    expiresIn: jwtExpiresIn,
    algorithm: "HS256",
  };

  return jwt.sign({ role }, jwtSecret, options);
};

export { jwtSecret, jwtExpiresIn, signAccessToken };
