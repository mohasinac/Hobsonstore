import Link from "next/link";
import { ROUTES } from "@/constants/routes";

interface EmptyCartProps {
  onClose?: () => void;
}

export function EmptyCart({ onClose }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span style={{ fontSize: "3rem" }}>🛒</span>
      <p
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          fontSize: "1.2rem",
          letterSpacing: "0.06em",
          color: "#0D0D0D",
        }}
      >
        YOUR CART IS EMPTY!
      </p>
      <Link
        href={ROUTES.COLLECTIONS}
        onClick={onClose}
        className="text-sm font-bold hover:underline"
        style={{ color: "#E8001C" }}
      >
        Continue shopping →
      </Link>
    </div>
  );
}
