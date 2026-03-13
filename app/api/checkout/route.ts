import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp, getAdminDb } from "@/lib/firebase/admin";
import { buildCheckoutMessageURL } from "@/lib/whatsapp";
import { COLLECTIONS } from "@/constants/firebase";
import type { CartItem } from "@/types/cart";
import type { Address } from "@/types/order";
import type { Discount, LoyaltyConfig } from "@/types/config";
import type { User } from "@/types/user";
import { applyCoinsToOrder } from "@/lib/loyalty";

interface CheckoutBody {
  items: CartItem[];
  address: Address;
  total: number;
  discountCode?: string | null;
  coinsToRedeem?: number;
}

export async function POST(req: NextRequest) {
  // Resolve the authenticated user from the session cookie.
  // Guest checkout is allowed (userId = "guest"); coin redemption requires auth.
  let userId = "guest";
  const sessionCookie = req.cookies.get("__session")?.value;
  if (sessionCookie) {
    try {
      const decoded = await getAuth(getAdminApp()).verifySessionCookie(sessionCookie, true);
      userId = decoded.uid;
    } catch {
      // Cookie invalid/expired — treat as guest
    }
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    items,
    address,
    total: subtotal,
    discountCode,
    coinsToRedeem = 0,
  } = body;

  if (!items?.length || items.length > 50) {
    return NextResponse.json({ error: items?.length ? "Too many items in cart." : "Cart is empty." }, { status: 400 });
  }
  if (items.some((i) => !i.productId || typeof i.productId !== "string" || !i.productId.trim())) {
    return NextResponse.json({ error: "Invalid item in cart." }, { status: 400 });
  }
  if (items.some((i) => !Number.isInteger(i.qty) || i.qty < 1)) {
    return NextResponse.json({ error: "Invalid item quantity." }, { status: 400 });
  }
  if (
    !address?.name ||
    !address?.phone ||
    !address?.line1 ||
    !address?.city ||
    !address?.pincode
  ) {
    return NextResponse.json(
      { error: "Incomplete delivery address." },
      { status: 400 },
    );
  }
  if (
    address.name.length > 100 ||
    address.line1.length > 200 ||
    (address.line2 && address.line2.length > 200) ||
    address.city.length > 100
  ) {
    return NextResponse.json({ error: "Address fields are too long." }, { status: 400 });
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
      // -- 1. Validate discount code -----------------------------------------
      let discountAmount = 0;
      let validatedDiscount: Discount | null = null;

      if (discountCode) {
        const discountRef = db
          .collection(COLLECTIONS.DISCOUNTS)
          .doc(discountCode.toUpperCase());
        const discountSnap = await tx.get(discountRef);

        if (discountSnap.exists) {
          const d = discountSnap.data() as Discount;
          const now = new Date();
          const expired =
            d.expiresAt &&
            (d.expiresAt as unknown as Timestamp).toDate() < now;
          const limitReached =
            d.maxUses !== undefined && d.usedCount >= d.maxUses;
          const belowMin =
            d.minOrderValue !== undefined && subtotal < d.minOrderValue;

          if (d.active && !expired && !limitReached && !belowMin) {
            validatedDiscount = d;
            discountAmount =
              d.type === "percent"
                ? Math.floor((subtotal * d.value) / 100)
                : Math.min(d.value, subtotal);

            // Increment usage count
            tx.update(discountRef, { usedCount: d.usedCount + 1 });
          }
        }
      }

      // -- 2. Validate coin redemption ---------------------------------------
      let coinsDiscount = 0;
      const safeCoinsToRedeem = Math.max(0, Math.floor(coinsToRedeem));

      if (safeCoinsToRedeem > 0 && userId !== "guest") {
        const loyaltyRef = db
          .collection(COLLECTIONS.LOYALTY_CONFIG)
          .doc("main");
        const [loyaltySnap, userSnap] = await Promise.all([
          tx.get(loyaltyRef),
          tx.get(db.collection(COLLECTIONS.USERS).doc(userId)),
        ]);

        if (loyaltySnap.exists && userSnap.exists) {
          const loyaltyConfig = loyaltySnap.data() as LoyaltyConfig;
          const userData = userSnap.data() as User;
          const userBalance = userData.hcCoins ?? 0;

          if (loyaltyConfig.active && userBalance >= safeCoinsToRedeem) {
            const postDiscountTotal = subtotal - discountAmount;
            coinsDiscount = applyCoinsToOrder(
              safeCoinsToRedeem,
              postDiscountTotal,
              loyaltyConfig,
            );

            // Deduct only the coins that correspond to the actual discount awarded
            const coinsActuallyUsed = loyaltyConfig.rupeePerCoin > 0
              ? Math.ceil(coinsDiscount / loyaltyConfig.rupeePerCoin)
              : safeCoinsToRedeem;

            // Deduct coins from user balance
            const coinEntry = {
              delta: -coinsActuallyUsed,
              reason: "redemption",
              timestamp: FieldValue.serverTimestamp(),
            };
            tx.update(db.collection(COLLECTIONS.USERS).doc(userId), {
              hcCoins: FieldValue.increment(-coinsActuallyUsed),
              coinHistory: FieldValue.arrayUnion(coinEntry),
            });
          }
        }
      }

      const finalTotal = Math.max(0, subtotal - discountAmount - coinsDiscount);

      // -- 3. Reserve stock --------------------------------------------------
      let isPreorderOrder = false;
      for (const item of items) {
        const productRef = db
          .collection(COLLECTIONS.PRODUCTS)
          .doc(item.productId);
        const snap = await tx.get(productRef);
        if (!snap.exists) {
          throw new Error(`Product "${item.name}" is no longer available.`);
        }
        const data = snap.data() as {
          availableStock?: number;
          isPreorder?: boolean;
          salePrice?: number;
        };
        if (data.isPreorder) isPreorderOrder = true;
        const available = data.availableStock ?? 0;
        if (!data.isPreorder && available < item.qty) {
          throw new Error(`Only ${available} unit(s) of "${item.name}" left.`);
        }
        tx.update(productRef, {
          availableStock: FieldValue.increment(-item.qty),
          reservedStock: FieldValue.increment(item.qty),
        });
      }

      // -- 4. Create order ---------------------------------------------------
      const orderRef = db.collection(COLLECTIONS.ORDERS).doc();
      tx.set(orderRef, {
        userId,
        items,
        address,
        subtotal,
        discountCode: validatedDiscount?.code ?? null,
        discountAmount,
        coinsRedeemed: safeCoinsToRedeem > 0 ? safeCoinsToRedeem : 0,
        coinsDiscount,
        total: finalTotal,
        isPreorder: isPreorderOrder,
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
    const waUrl = buildCheckoutMessageURL(
      waNumber,
      items,
      subtotal,
      address,
      isPreorder,
    );

    return NextResponse.json({ orderId, waUrl }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Order could not be placed.";
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
