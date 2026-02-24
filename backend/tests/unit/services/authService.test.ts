import bcrypt from "bcryptjs";

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock("../../../src/config/database", () => ({
  prisma: prismaMock,
  connectDatabase: jest.fn(),
}));

const { login, signup } = require("../../../src/services/authService");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws 409 when email exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "user-1" });

    await expect(
      signup({
        name: "Test",
        email: "test@example.com",
        password: "Password123!",
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("creates user on signup", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      name: "Test",
      email: "test@example.com",
      role: "READER",
      passwordHash: "hashed",
    });
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed" as never);

    const result = await signup({
      name: "Test",
      email: "test@example.com",
      password: "Password123!",
    });

    expect(result.user.id).toBe("user-1");
  });

  it("throws 401 on invalid login", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      login({ email: "test@example.com", password: "Password123!" }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("returns token on login", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Test",
      email: "test@example.com",
      role: "READER",
      passwordHash: "hashed",
    });
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    const result = await login({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(result.token).toBeDefined();
  });
});
