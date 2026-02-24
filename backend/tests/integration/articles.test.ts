import request from "supertest";
import jwt from "jsonwebtoken";

const prismaMock = {
  article: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  readLog: {
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

const authorToken = jwt.sign({ role: "AUTHOR" }, process.env.JWT_SECRET || "", {
  subject: "author-1",
});
const readerToken = jwt.sign({ role: "READER" }, process.env.JWT_SECRET || "", {
  subject: "reader-1",
});
const articleId = "11111111-1111-1111-1111-111111111111";

describe("Article endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns public feed", async () => {
    prismaMock.article.findMany.mockResolvedValue([
      { id: "a1", title: "Title", author: { id: "u1", name: "Author" } },
    ]);
    prismaMock.article.count.mockResolvedValue(1);

    const response = await request(app).get("/articles");

    expect(response.status).toBe(200);
    expect(response.body.Success).toBe(true);
  });

  it("returns 200 for public article and logs read", async () => {
    prismaMock.article.findFirst.mockResolvedValue({
      id: articleId,
      title: "Title",
      author: { id: "u1", name: "Author" },
    });

    const response = await request(app).get(`/articles/${articleId}`);

    expect(response.status).toBe(200);
    expect(prismaMock.readLog.create).toHaveBeenCalled();
  });

  it("returns 404 for missing public article", async () => {
    prismaMock.article.findFirst.mockResolvedValue(null);

    const response = await request(app).get(`/articles/${articleId}`);

    expect(response.status).toBe(404);
    expect(response.body.Message).toBe("News article no longer available");
  });

  it("rejects creating article without auth", async () => {
    const response = await request(app)
      .post("/articles")
      .send({
        title: "Title",
        content: "A".repeat(60),
        category: "Tech",
      });

    expect(response.status).toBe(401);
  });

  it("rejects creating article for reader role", async () => {
    const response = await request(app)
      .post("/articles")
      .set("Authorization", `Bearer ${readerToken}`)
      .send({
        title: "Title",
        content: "A".repeat(60),
        category: "Tech",
      });

    expect(response.status).toBe(403);
  });

  it("rejects creating article with invalid body", async () => {
    const response = await request(app)
      .post("/articles")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "",
        content: "short",
        category: "",
      });

    expect(response.status).toBe(422);
  });

  it("creates article", async () => {
    prismaMock.article.create.mockResolvedValue({
      id: "a1",
      title: "Title",
      content: "A".repeat(60),
      category: "Tech",
      status: "DRAFT",
      authorId: "author-1",
    });

    const response = await request(app)
      .post("/articles")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "Title",
        content: "A".repeat(60),
        category: "Tech",
      });

    expect(response.status).toBe(201);
  });

  it("returns 401 for author articles without auth", async () => {
    const response = await request(app).get("/articles/me");
    expect(response.status).toBe(401);
  });

  it("returns 403 for author articles with reader token", async () => {
    const response = await request(app)
      .get("/articles/me")
      .set("Authorization", `Bearer ${readerToken}`);
    expect(response.status).toBe(403);
  });

  it("returns 200 for author articles", async () => {
    prismaMock.article.findMany.mockResolvedValue([{ id: "a1" }]);
    prismaMock.article.count.mockResolvedValue(1);

    const response = await request(app)
      .get("/articles/me")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(response.status).toBe(200);
  });

  it("returns 404 when updating missing article", async () => {
    prismaMock.article.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .put(`/articles/${articleId}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .send({ title: "New" });

    expect(response.status).toBe(404);
  });

  it("updates article", async () => {
    prismaMock.article.findFirst.mockResolvedValue({ id: articleId });
    prismaMock.article.update.mockResolvedValue({
      id: articleId,
      title: "New",
    });

    const response = await request(app)
      .put(`/articles/${articleId}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .send({ title: "New" });

    expect(response.status).toBe(200);
  });

  it("soft deletes article", async () => {
    prismaMock.article.findFirst.mockResolvedValue({ id: articleId });
    prismaMock.article.update.mockResolvedValue({ id: articleId });

    const response = await request(app)
      .delete(`/articles/${articleId}`)
      .set("Authorization", `Bearer ${authorToken}`);

    expect(response.status).toBe(200);
  });
});
