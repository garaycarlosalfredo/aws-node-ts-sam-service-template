import { DomainError, NotFoundError } from "./index";

describe("NotFoundError", () => {
  it("describes a missing resource", () => {
    const error = new NotFoundError("User");
    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe("NotFoundError");
    expect(error.message).toBe("User not found");
  });

  it("includes an identifier when supplied", () => {
    expect(new NotFoundError("User", "42").message).toBe("User '42' not found");
  });
});
