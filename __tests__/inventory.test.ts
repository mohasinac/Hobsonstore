import { describe, it, expect } from "vitest";
import {
  parseRestockCommand,
  parseSoldOutCommand,
  parsePreorderCommand,
  parseStockCommand,
} from "@/lib/inventory";

describe("parseRestockCommand", () => {
  it("parses a valid RESTOCK command", () => {
    expect(parseRestockCommand("RESTOCK SKU-123 qty:50")).toEqual({
      sku: "SKU-123",
      qty: 50,
    });
  });

  it("is case-insensitive", () => {
    expect(parseRestockCommand("restock hot-toys-batman qty:5")).toEqual({
      sku: "hot-toys-batman",
      qty: 5,
    });
  });

  it("trims leading/trailing whitespace", () => {
    expect(parseRestockCommand("  RESTOCK ABC qty:10  ")).toEqual({
      sku: "ABC",
      qty: 10,
    });
  });

  it("returns null for a qty of 0", () => {
    expect(parseRestockCommand("RESTOCK SKU-1 qty:0")).toBeNull();
  });

  it("returns null for negative qty", () => {
    expect(parseRestockCommand("RESTOCK SKU-1 qty:-3")).toBeNull();
  });

  it("returns null for missing qty", () => {
    expect(parseRestockCommand("RESTOCK SKU-1")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseRestockCommand("")).toBeNull();
  });

  it("returns null for an unrelated message", () => {
    expect(parseRestockCommand("HELP")).toBeNull();
  });
});

describe("parseSoldOutCommand", () => {
  it("parses a valid SOLDOUT command", () => {
    expect(parseSoldOutCommand("SOLDOUT SKU-999")).toBe("SKU-999");
  });

  it("is case-insensitive", () => {
    expect(parseSoldOutCommand("soldout some-product")).toBe("some-product");
  });

  it("returns null for missing SKU", () => {
    expect(parseSoldOutCommand("SOLDOUT")).toBeNull();
  });
});

describe("parsePreorderCommand", () => {
  it("parses a valid PREORDER command", () => {
    expect(parsePreorderCommand("PREORDER SKU-X date:Q3-2026")).toEqual({
      sku: "SKU-X",
      shipDate: "Q3-2026",
    });
  });

  it("returns null for an invalid date format", () => {
    expect(parsePreorderCommand("PREORDER SKU-X date:2026-Q3")).toBeNull();
  });

  it("returns null for missing date", () => {
    expect(parsePreorderCommand("PREORDER SKU-X")).toBeNull();
  });
});

describe("parseStockCommand", () => {
  it("parses a valid STOCK command", () => {
    expect(parseStockCommand("STOCK SKU-42")).toBe("SKU-42");
  });

  it("returns null for missing SKU", () => {
    expect(parseStockCommand("STOCK")).toBeNull();
  });
});
