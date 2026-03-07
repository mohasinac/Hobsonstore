export const INVENTORY_COMMANDS = {
  RESTOCK: "RESTOCK", // RESTOCK {sku} qty:{n}
  SOLDOUT: "SOLDOUT", // SOLDOUT {sku}
  PREORDER: "PREORDER", // PREORDER {sku} date:{Q-YYYY}
  STATUS: "STATUS", // STATUS {orderId} {newStatus} [awb:{n}]
  STOCK: "STOCK", // STOCK {sku} → reply with count
  HELP: "HELP",
} as const;

export type InventoryCommand = keyof typeof INVENTORY_COMMANDS;
