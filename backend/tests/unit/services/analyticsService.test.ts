const prismaMock = {
  readLog: {
    groupBy: jest.fn(),
  },
  dailyAnalytics: {
    upsert: jest.fn(),
    groupBy: jest.fn(),
  },
  $transaction: jest.fn().mockResolvedValue([]),
};

jest.mock("../../../src/config/database", () => ({
  prisma: prismaMock,
  connectDatabase: jest.fn(),
}));

const {
  aggregateDailyAnalytics,
  getArticleViewTotals,
} = require("../../../src/services/analyticsService");

describe("analyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("skips aggregation when no reads", async () => {
    prismaMock.readLog.groupBy.mockResolvedValue([]);

    await aggregateDailyAnalytics(new Date());

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns view totals", async () => {
    prismaMock.dailyAnalytics.groupBy.mockResolvedValue([
      { articleId: "a1", _sum: { viewCount: 5 } },
    ]);

    const totals = await getArticleViewTotals(["a1"]);

    expect(totals.get("a1")).toBe(5);
  });
});
