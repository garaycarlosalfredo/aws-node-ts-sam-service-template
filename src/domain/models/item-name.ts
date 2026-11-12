import { ValidationError } from "../errors";

export class ItemName {
  private constructor(public readonly value: string) {}

  public static create(value: string): ItemName {
    const normalized = value.trim();

    if (!normalized) {
      throw new ValidationError("Item name is required");
    }

    return new ItemName(normalized);
  }

  public toString(): string {
    return this.value;
  }
}
