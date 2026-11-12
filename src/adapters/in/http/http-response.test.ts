import { HttpResponse } from "./http-response";

describe("HttpResponse", () => {
  it("returns a JSON success envelope", () => {
    const response = HttpResponse.ok({ message: "Hello" });
    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(response.body)).toEqual({
      success: true,
      data: { message: "Hello" },
    });
  });

  it("returns a JSON created envelope", () => {
    const response = HttpResponse.created({ id: "1" });
    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      success: true,
      data: { id: "1" },
    });
  });

  it("includes validation issues when present", () => {
    const errors = [{ path: "name", code: "invalid", message: "Required" }];
    const response = HttpResponse.badRequest("Validation failed", errors);
    expect(response.statusCode).toBe(400);
    expect(response.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(response.body)).toEqual({
      success: false,
      message: "Validation failed",
      errors,
    });
  });

  it.each([undefined, []])("omits empty validation issues", (errors) => {
    const response = HttpResponse.badRequest("Invalid", errors);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      success: false,
      message: "Invalid",
    });
  });

  it("returns a not found envelope", () => {
    const response = HttpResponse.notFound("User not found");
    expect(response.statusCode).toBe(404);
    expect(response.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(response.body)).toEqual({
      success: false,
      message: "User not found",
    });
  });

  it("returns a conflict envelope", () => {
    const response = HttpResponse.conflict("Item is archived");
    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body)).toEqual({
      success: false,
      message: "Item is archived",
    });
  });

  it.each(["Internal server error", "Custom error"])(
    "returns a server error envelope: %s",
    (message) => {
      const response =
        message === "Internal server error"
          ? HttpResponse.internalServerError()
          : HttpResponse.internalServerError(message);
      expect(response.statusCode).toBe(500);
      expect(response.headers).toEqual({ "Content-Type": "application/json" });
      expect(JSON.parse(response.body)).toEqual({ success: false, message });
    },
  );
});
