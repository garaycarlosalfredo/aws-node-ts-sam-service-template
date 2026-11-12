import { InvalidStateError, ValidationError } from "../errors";
import { ItemCreated, ItemStockDepleted } from "../events";
import { Item } from "./item";
import { ItemName } from "./item-name";
import { Quantity } from "./quantity";

const buildItem = (stock = 5): Item =>
  Item.create("item-1", ItemName.create("Widget"), Quantity.create(stock));

describe("Item", () => {
  it("is created active with the given stock", () => {
    const item = buildItem(5);

    expect(item.id).toBe("item-1");
    expect(item.name.value).toBe("Widget");
    expect(item.stock.value).toBe(5);
    expect(item.status).toBe("active");
  });

  it("restores persisted state, including the archived status", () => {
    const item = Item.restore(
      "item-2",
      ItemName.create("Gadget"),
      Quantity.create(0),
      "archived",
    );

    expect(item.status).toBe("archived");
    expect(item.stock.value).toBe(0);
  });

  describe("addStock", () => {
    it("increases the stock", () => {
      const item = buildItem(5);

      item.addStock(Quantity.create(3));

      expect(item.stock.value).toBe(8);
    });
  });

  describe("removeStock", () => {
    it("decreases the stock", () => {
      const item = buildItem(5);

      item.removeStock(Quantity.create(2));

      expect(item.stock.value).toBe(3);
    });

    it("allows removing exactly the available stock", () => {
      const item = buildItem(5);

      item.removeStock(Quantity.create(5));

      expect(item.stock.isZero()).toBe(true);
    });

    it("rejects removing more than the available stock and leaves it untouched", () => {
      const item = buildItem(2);

      expect(() => item.removeStock(Quantity.create(3))).toThrow(
        ValidationError,
      );
      expect(() => item.removeStock(Quantity.create(3))).toThrow(
        "Not enough stock",
      );
      expect(item.stock.value).toBe(2);
    });
  });

  describe("archive", () => {
    it("archives an item without stock", () => {
      const item = buildItem(0);

      item.archive();

      expect(item.status).toBe("archived");
    });

    it("rejects archiving an item that still has stock", () => {
      const item = buildItem(1);

      expect(() => item.archive()).toThrow(InvalidStateError);
      expect(item.status).toBe("active");
    });
  });

  describe("archived item", () => {
    const buildArchived = (): Item => {
      const item = buildItem(0);
      item.archive();
      return item;
    };

    it.each([
      ["addStock", (item: Item) => item.addStock(Quantity.create(1))],
      ["removeStock", (item: Item) => item.removeStock(Quantity.create(1))],
      ["archive", (item: Item) => item.archive()],
    ])("rejects %s", (_name, action) => {
      expect(() => action(buildArchived())).toThrow(InvalidStateError);
      expect(() => action(buildArchived())).toThrow("Item is archived");
    });
  });

  describe("domain events", () => {
    it("records ItemCreated when created and forgets it once pulled", () => {
      const item = buildItem(5);

      expect(item.pullEvents()).toEqual([new ItemCreated("item-1", 5)]);
      expect(item.pullEvents()).toEqual([]);
    });

    it("records ItemStockDepleted only when the stock reaches zero", () => {
      const item = buildItem(5);
      item.pullEvents();

      item.removeStock(Quantity.create(2));
      expect(item.pullEvents()).toEqual([]);

      item.removeStock(Quantity.create(3));
      expect(item.pullEvents()).toEqual([new ItemStockDepleted("item-1")]);
    });

    it("does not record events when an item is restored from persistence", () => {
      const item = Item.restore(
        "item-2",
        ItemName.create("Gadget"),
        Quantity.create(1),
        "active",
      );

      expect(item.pullEvents()).toEqual([]);
    });

    it("does not record events for rejected operations", () => {
      const item = buildItem(1);
      item.pullEvents();

      expect(() => item.removeStock(Quantity.create(2))).toThrow(
        ValidationError,
      );
      expect(item.pullEvents()).toEqual([]);
    });
  });
});
