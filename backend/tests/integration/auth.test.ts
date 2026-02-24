import request from "supertest";
import bcrypt from "bcryptjs";

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock("../../src/config/database", () => ({
  prisma: prismaMock,
  connectDatabase: jest.fn(),
}));

jest.mock("../../src/config/redis", () => ({
  getRedisClient: () => null,
}));

const app = require("../../src/app").default;

describe("Auth endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 201 on signup", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "READER",
      passwordHash: "hashed",
    });
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed" as never);

    const response = await request(app).post("/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
      role: "READER",
    });

    expect(response.status).toBe(201);
    expect(response.body.Success).toBe(true);
    expect(response.body.Object.user.email).toBe("test@example.com");
  });

  it("returns 409 for duplicate signup", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "user-1" });

    const response = await request(app).post("/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(409);
    expect(response.body.Success).toBe(false);
  });

  it("returns 422 for invalid signup", async () => {
    const response = await request(app).post("/auth/signup").send({
      name: "T",
      email: "bad",
      password: "short",
    });

    expect(response.status).toBe(422);
    expect(response.body.Success).toBe(false);
  });

  it("returns 200 on login", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "READER",
      passwordHash: "hashed",
    });
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    const response = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(200);
    expect(response.body.Success).toBe(true);
  });

  it("returns 401 on invalid login", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "READER",
      passwordHash: "hashed",
    });
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

    const response = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "wrong",
    });

    expect(response.status).toBe(401);
    expect(response.body.Success).toBe(false);
  });
});
