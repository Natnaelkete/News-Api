import { requireRole } from "../../../src/middleware/rbac";

const res = () => {
  const response: any = {};
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response;
};

describe("requireRole middleware", () => {
  it("returns 401 when missing user", () => {
    const req: any = {};
    const response = res();
    const next = jest.fn();

    requireRole("AUTHOR")(req, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when role not allowed", () => {
    const req: any = { user: { role: "READER" } };
    const response = res();
    const next = jest.fn();

    requireRole("AUTHOR")(req, response, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when role allowed", () => {
    const req: any = { user: { role: "AUTHOR" } };
    const response = res();
    const next = jest.fn();

    requireRole("AUTHOR")(req, response, next);

    expect(next).toHaveBeenCalled();
  });
});
