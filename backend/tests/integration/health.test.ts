import request from "supertest";

jest.mock("../../src/config/database", () => ({
  prisma: {},
  connectDatabase: jest.fn(),
}));

jest.mock("../../src/config/redis", () => ({
  getRedisClient: () => null,
}));

const app = require("../../src/app").default;

describe("Health endpoint", () => {
  it("returns ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
