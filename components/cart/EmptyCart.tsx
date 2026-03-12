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
          color: "var(--color-black)",
        }}
      >
        YOUR CART IS EMPTY!
      </p>
      <Link
        href={ROUTES.COLLECTIONS}
        onClick={onClose}
        className="text-sm font-bold hover:underline"
        style={{ color: "var(--color-red)" }}
      >
        Continue shopping →
      </Link>
    </div>
  );
}
