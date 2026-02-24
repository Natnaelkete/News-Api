import jwt from "jsonwebtoken";
import { authenticate } from "../../../src/middleware/auth";

const res = () => {
  const response: any = {};
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response;
};

describe("authenticate middleware", () => {
  it("returns 401 when missing token", () => {
    const req: any = { headers: {} };
    const response = res();
    const next = jest.fn();

    authenticate(req, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid token", () => {
    const req: any = { headers: { authorization: "Bearer bad" } };
    const response = res();
    const next = jest.fn();

    authenticate(req, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("sets user and calls next for valid token", () => {
    const token = jwt.sign({ role: "AUTHOR" }, process.env.JWT_SECRET || "", {
      subject: "user-1",
    });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const response = res();
    const next = jest.fn();

    authenticate(req, response, next);

    expect(req.user).toEqual({ id: "user-1", role: "AUTHOR" });
    expect(next).toHaveBeenCalled();
  });
});
