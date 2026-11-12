import { DomainError, ValidationError } from "./index";

describe("ValidationError", () => {
  it("is a domain error with a default message and no details", () => {
    const error = new ValidationError();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe("ValidationError");
    expect(error.message).toBe("Validation failed");
    expect(error.details).toEqual([]);
  });

  it("preserves a custom message and validation details", () => {
    const details = [
      { path: "name", code: "required", message: "Name is required" },
    ];
    const error = new ValidationError("Invalid input", details);
    expect(error.message).toBe("Invalid input");
    expect(error.details).toEqual(details);
  });
});
