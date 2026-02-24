const prismaMock = {
  article: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
  },
};

jest.mock("../../../src/config/database", () => ({
  prisma: prismaMock,
  connectDatabase: jest.fn(),
}));

const {
  getPublicArticleById,
  getPublicArticles,
} = require("../../../src/services/articleService");

describe("articleService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns public articles", async () => {
    prismaMock.article.findMany.mockResolvedValue([{ id: "a1" }]);
    prismaMock.article.count.mockResolvedValue(1);

    const result = await getPublicArticles({}, 1, 10);

    expect(result.total).toBe(1);
  });

  it("throws 404 when public article missing", async () => {
    prismaMock.article.findFirst.mockResolvedValue(null);

    await expect(getPublicArticleById("a1")).rejects.toMatchObject({
      status: 404,
    });
  });
});
