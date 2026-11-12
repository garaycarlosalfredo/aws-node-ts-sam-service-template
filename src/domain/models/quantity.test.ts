import { ValidationError } from "../errors";
import { Quantity } from "./quantity";

describe("Quantity", () => {
  it("accepts zero and positive integers", () => {
    expect(Quantity.create(0).value).toBe(0);
    expect(Quantity.create(5).value).toBe(5);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects %p",
    (value) => {
      expect(() => Quantity.create(value)).toThrow(ValidationError);
    },
  );

  it("adds and subtracts without mutating the operands", () => {
    const five = Quantity.create(5);
    const two = Quantity.create(2);

    expect(five.add(two).value).toBe(7);
    expect(five.subtract(two).value).toBe(3);
    expect(five.value).toBe(5);
    expect(two.value).toBe(2);
  });

  it("rejects a subtraction that would go below zero", () => {
    expect(() => Quantity.create(1).subtract(Quantity.create(2))).toThrow(
      ValidationError,
    );
  });

  it("compares and detects zero", () => {
    expect(Quantity.create(3).isGreaterThan(Quantity.create(2))).toBe(true);
    expect(Quantity.create(2).isGreaterThan(Quantity.create(2))).toBe(false);
    expect(Quantity.create(0).isZero()).toBe(true);
    expect(Quantity.create(1).isZero()).toBe(false);
  });
});
