import request from "supertest";
import jwt from "jsonwebtoken";

const prismaMock = {
  article: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  dailyAnalytics: {
    groupBy: jest.fn(),
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

const authorToken = jwt.sign({ role: "AUTHOR" }, process.env.JWT_SECRET || "", {
  subject: "author-1",
});
const readerToken = jwt.sign({ role: "READER" }, process.env.JWT_SECRET || "", {
  subject: "reader-1",
});

describe("Author dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 without auth", async () => {
    const response = await request(app).get("/author/dashboard");
    expect(response.status).toBe(401);
  });

  it("returns 403 for reader role", async () => {
    const response = await request(app)
      .get("/author/dashboard")
      .set("Authorization", `Bearer ${readerToken}`);
    expect(response.status).toBe(403);
  });

  it("returns 200 with dashboard data", async () => {
    prismaMock.article.findMany.mockResolvedValue([{ id: "a1" }]);
    prismaMock.article.count.mockResolvedValue(1);
    prismaMock.dailyAnalytics.groupBy.mockResolvedValue([
      { articleId: "a1", _sum: { viewCount: 3 } },
    ]);

    const response = await request(app)
      .get("/author/dashboard")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.Object[0].totalViews).toBe(3);
  });
});
