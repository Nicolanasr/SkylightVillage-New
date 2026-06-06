"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. CONSUMABLE STOCK CRUD ACTIONS
// ==========================================

export async function createStockItem(data: {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  expirationDate?: string | null;
}) {
  try {
    const item = await db.stockItem.create({
      data: {
        name: data.name,
        category: data.category,
        quantity: Number(data.quantity),
        unit: data.unit,
        minThreshold: Number(data.minThreshold),
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
      },
    });

    if (Number(data.quantity) > 0) {
      await db.stockMovement.create({
        data: {
          stockItemId: item.id,
          quantity: Number(data.quantity),
          type: "RESTOCK",
          notes: "Initial inventory setup",
        },
      });
    }

    revalidatePath("/dashboard/admin");
    return { success: true, item };
  } catch (error: any) {
    console.error("Create stock item error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateStockItem(
  id: string,
  data: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minThreshold: number;
    expirationDate?: string | null;
  }
) {
  try {
    const item = await db.stockItem.findUnique({ where: { id } });
    if (!item) throw new Error("Stock item not found");

    const diff = Number(data.quantity) - item.quantity;

    const updatedItem = await db.stockItem.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        quantity: Number(data.quantity),
        unit: data.unit,
        minThreshold: Number(data.minThreshold),
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
      },
    });

    if (diff !== 0) {
      await db.stockMovement.create({
        data: {
          stockItemId: id,
          quantity: diff,
          type: "ADJUSTMENT",
          notes: `Quantity manual edit from ${item.quantity} to ${data.quantity}`,
        },
      });
    }

    revalidatePath("/dashboard/admin");
    return { success: true, item: updatedItem };
  } catch (error: any) {
    console.error("Update stock item error:", error);
    return { success: false, error: error.message };
  }
}

export async function restockItem(id: string, quantityToAdd: number) {
  try {
    const item = await db.stockItem.update({
      where: { id },
      data: { quantity: { increment: Number(quantityToAdd) } },
    });

    await db.stockMovement.create({
      data: {
        stockItemId: id,
        quantity: Number(quantityToAdd),
        type: "RESTOCK",
        notes: "Manual quick restock",
      },
    });

    revalidatePath("/dashboard/admin");
    return { success: true, item };
  } catch (error: any) {
    console.error("Restock item error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteStockItem(id: string) {
  try {
    // Delete any related waste logs first
    await db.wasteLog.deleteMany({ where: { stockItemId: id } });
    await db.stockItem.delete({ where: { id } });
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete stock item error:", error);
    return { success: false, error: error.message };
  }
}

export async function logStockWaste(
  stockItemId: string,
  quantity: number,
  reason: string
) {
  try {
    const item = await db.stockItem.findUnique({ where: { id: stockItemId } });
    if (!item) throw new Error("Stock item not found");

    if (item.quantity < quantity) {
      throw new Error(`Insufficient stock. Only ${item.quantity} units available.`);
    }

    // Deduct stock, log waste, and create movement entry
    await db.$transaction([
      db.stockItem.update({
        where: { id: stockItemId },
        data: { quantity: { decrement: Number(quantity) } },
      }),
      db.wasteLog.create({
        data: {
          stockItemId,
          quantity: Number(quantity),
          reason,
        },
      }),
      db.stockMovement.create({
        data: {
          stockItemId,
          quantity: -Number(quantity),
          type: "WASTE",
          notes: `Waste write-off: ${reason}`,
        },
      }),
    ]);

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Log stock waste error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 2. PHYSICAL ASSET CRUD ACTIONS
// ==========================================

export async function createAsset(data: { name: string; totalQty: number }) {
  try {
    const asset = await db.asset.create({
      data: {
        name: data.name,
        totalQty: Number(data.totalQty),
      },
    });
    revalidatePath("/dashboard/admin");
    return { success: true, asset };
  } catch (error: any) {
    console.error("Create asset error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAsset(
  id: string,
  data: { name: string; totalQty: number }
) {
  try {
    const asset = await db.asset.update({
      where: { id },
      data: {
        name: data.name,
        totalQty: Number(data.totalQty),
      },
    });
    revalidatePath("/dashboard/admin");
    return { success: true, asset };
  } catch (error: any) {
    console.error("Update asset error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAsset(id: string) {
  try {
    // Delete allocations first
    await db.assetAllocation.deleteMany({ where: { assetId: id } });
    await db.asset.delete({ where: { id } });
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete asset error:", error);
    return { success: false, error: error.message };
  }
}

export async function allocateAsset(data: {
  assetId: string;
  location: string;
  quantity: number;
  status: string;
}) {
  try {
    const asset = await db.asset.findUnique({
      where: { id: data.assetId },
      include: { allocations: true },
    });
    if (!asset) throw new Error("Asset not found");

    const currentAllocated = asset.allocations.reduce((sum, a) => sum + a.quantity, 0);
    const available = asset.totalQty - currentAllocated;

    if (data.quantity > available) {
      throw new Error(`Insufficient assets. Total: ${asset.totalQty}, Allocated: ${currentAllocated}, Available: ${available}.`);
    }

    const allocation = await db.assetAllocation.create({
      data: {
        assetId: data.assetId,
        location: data.location,
        quantity: Number(data.quantity),
        status: data.status,
      },
    });

    revalidatePath("/dashboard/admin");
    return { success: true, allocation };
  } catch (error: any) {
    console.error("Allocate asset error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAssetAllocation(id: string) {
  try {
    await db.assetAllocation.delete({ where: { id } });
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete allocation error:", error);
    return { success: false, error: error.message };
  }
}
