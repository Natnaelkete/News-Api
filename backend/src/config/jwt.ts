import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

const jwtSecret = process.env.JWT_SECRET
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "24h";

const signAccessToken = (userId: string, role: Role): string => {
	return jwt.sign({ role }, jwtSecret!, {
		subject: userId,
		expiresIn: jwtExpiresIn,
		algorithm: "HS256"
	});
};

export { jwtSecret, jwtExpiresIn, signAccessToken };
