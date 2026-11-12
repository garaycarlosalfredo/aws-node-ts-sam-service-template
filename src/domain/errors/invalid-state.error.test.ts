import { DomainError, InvalidStateError } from "./index";

describe("InvalidStateError", () => {
  it("is a domain error that keeps its message", () => {
    const error = new InvalidStateError("Item is archived");

    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe("InvalidStateError");
    expect(error.message).toBe("Item is archived");
  });
});
