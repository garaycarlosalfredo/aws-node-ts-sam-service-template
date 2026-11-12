import { ValidationError } from "../errors";

export class Quantity {
  private constructor(public readonly value: number) {}

  public static create(value: number): Quantity {
    if (!Number.isInteger(value) || value < 0) {
      throw new ValidationError("Quantity must be a non-negative integer");
    }

    return new Quantity(value);
  }

  public add(other: Quantity): Quantity {
    return Quantity.create(this.value + other.value);
  }

  public subtract(other: Quantity): Quantity {
    if (other.isGreaterThan(this)) {
      throw new ValidationError("Quantity cannot be negative");
    }

    return Quantity.create(this.value - other.value);
  }

  public isGreaterThan(other: Quantity): boolean {
    return this.value > other.value;
  }

  public isZero(): boolean {
    return this.value === 0;
  }
}
