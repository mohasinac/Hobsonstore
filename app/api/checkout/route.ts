import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { buildCheckoutMessageURL } from "@/lib/whatsapp";
import { COLLECTIONS } from "@/constants/firebase";
import type { CartItem } from "@/types/cart";
import type { Address } from "@/types/order";

interface CheckoutBody {
  items: CartItem[];
  address: Address;
  userId: string;
  total: number;
}

export async function POST(req: NextRequest) {
  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { items, address, userId, total } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!address?.name || !address?.phone || !address?.line1 || !address?.city || !address?.pincode) {
    return NextResponse.json({ error: "Incomplete delivery address." }, { status: 400 });
  }
  if (!/^\d{6}$/.test(address.pincode)) {
    return NextResponse.json({ error: "Invalid pincode." }, { status: 400 });
  }
  if (address.phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  }

  try {
    const db = getAdminDb();

    const orderId = await db.runTransaction(async (tx) => {
      for (const item of items) {
        const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(item.productId);
        const snap = await tx.get(productRef);
        if (!snap.exists) {
          throw new Error(`Product "${item.name}" is no longer available.`);
        }
        const data = snap.data() as {
          availableStock?: number;
          isPreorder?: boolean;
          status?: string;
        };
        if (data.status === "sold-out") {
          throw new Error(`"${item.name}" is sold out.`);
        }
        const available = data.availableStock ?? 0;
        if (!data.isPreorder && available < item.qty) {
          throw new Error(`Only ${available} unit(s) of "${item.name}" left.`);
        }
        tx.update(productRef, {
          availableStock: FieldValue.increment(-item.qty),
          reservedStock: FieldValue.increment(item.qty),
        });
      }

      const orderRef = db.collection(COLLECTIONS.ORDERS).doc();
      tx.set(orderRef, {
        userId,
        items,
        address,
        subtotal: total,
        total,
        discount: 0,
        coinsRedeemed: 0,
        discountAmount: 0,
        isPreorder: items.some((i) => i.isPreorder),
        currentStatus: "pending_payment",
        statusHistory: [
          {
            status: "pending_payment",
            timestamp: FieldValue.serverTimestamp(),
            updatedBy: "system",
          },
        ],
        whatsappSent: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return orderRef.id;
    });

    const waNumber = process.env.WHATSAPP_NUMBER ?? "";
    const isPreorder = items.some((i) => i.isPreorder);
    const waUrl = buildCheckoutMessageURL(waNumber, items, total, address, isPreorder);

    return NextResponse.json({ orderId, waUrl }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order could not be placed.";
    if (
      message.includes("no longer available") ||
      message.includes("sold out") ||
      message.includes("unit(s) of")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[api/checkout]", err);
    return NextResponse.json(
      { error: "Order could not be placed. Please try again." },
      { status: 500 },
    );
  }
}
