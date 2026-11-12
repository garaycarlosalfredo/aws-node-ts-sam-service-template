import { ValidationError } from "../errors";
import { ItemName } from "./item-name";

describe("ItemName", () => {
  it("trims the name", () => {
    const name = ItemName.create("  Widget  ");

    expect(name.value).toBe("Widget");
    expect(name.toString()).toBe("Widget");
  });

  it.each(["", "   "])("rejects an empty name (%j)", (value) => {
    expect(() => ItemName.create(value)).toThrow(ValidationError);
    expect(() => ItemName.create(value)).toThrow("Item name is required");
  });
});
