import { z } from "zod";
import { validate } from "../../../src/middleware/validation";

const res = () => {
  const response: any = {};
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response;
};

describe("validation middleware", () => {
  it("returns 422 for invalid body", () => {
    const schema = z.object({ name: z.string().min(2) });
    const req: any = { body: { name: "A" } };
    const response = res();
    const next = jest.fn();

    validate(schema)(req, response, next);

    expect(response.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next for valid body", () => {
    const schema = z.object({ name: z.string().min(2) });
    const req: any = { body: { name: "Alex" } };
    const response = res();
    const next = jest.fn();

    validate(schema)(req, response, next);

    expect(next).toHaveBeenCalled();
  });
});
