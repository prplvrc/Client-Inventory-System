import { useEffect, useState } from "react";
import {
  X,
  Receipt,
  Loader2,
} from "lucide-react";
import { API_URL } from "../services/api";

interface TransactionItem {
  id: number;
  productId: number;
  product: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface TransactionDetails {
  id: number;
  saleDate: string;
  total: number;
  paymentMethod: string;
  status: string;
  voidReason?: string | null;

  branch: {
    id: number;
    code: string;
    name: string;
  };

  cashier: {
    id: number;
    username: string;
    name: string;
  };

  items: TransactionItem[];
}

interface TransactionDetailsModalProps {
  transactionId: number | null;
  onClose: () => void;
}

function TransactionDetailsModal({
  transactionId,
  onClose,
}: TransactionDetailsModalProps) {
  const [transaction, setTransaction] =
    useState<TransactionDetails | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (transactionId === null) {
      setTransaction(null);
      setError("");
      return;
    }

    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        setError("");
        setTransaction(null);

        if (!API_URL) {
          throw new Error("VITE_API_URL is not configured.");
        }

        const response = await fetch(
          `${API_URL}/sales/${transactionId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData =
            await response.json().catch(() => null);

          throw new Error(
            errorData?.message ||
              `Failed to fetch transaction: ${response.status}`
          );
        }

        const result: TransactionDetails =
          await response.json();

        setTransaction(result);
      } catch (err) {
        console.error(
          "Fetch transaction details error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load transaction details."
        );

        setTransaction(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  if (transactionId === null) {
    return null;
  }

  const saleDate = transaction
    ? new Date(transaction.saleDate)
    : null;

  const formattedDate = saleDate
    ? saleDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const formattedTime = saleDate
    ? saleDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm"
        onClick={(event) => event.stopPropagation()}
      >

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close transaction details"
          className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-md transition hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={15} />
        </button>

        {/* RECEIPT */}
        <div className="overflow-hidden bg-white shadow-2xl">

          {/* RECEIPT TOP */}
          <div className="px-7 pb-5 pt-7 text-center">

            <Receipt className="mx-auto mb-3 h-7 w-7 text-gray-700" />

            <h2 className="text-lg font-bold uppercase tracking-[0.18em] text-gray-900">
              Denbert's
            </h2>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-gray-500">
              Goto, Pares at iba pa
            </p>

            <div className="mt-5 border-t border-dashed border-gray-300" />

            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">
              Sales Receipt
            </p>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2
                    size={24}
                    className="animate-spin text-gray-500"
                  />

                  <p className="text-xs text-gray-500">
                    Loading transaction...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <p className="text-sm font-semibold text-red-600">
                  Unable to load transaction
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {error}
                </p>
              </div>
            ) : transaction ? (
              <div className="mt-4 text-left">

                {/* TRANSACTION INFORMATION */}
                <div className="space-y-1.5 text-[11px] text-gray-600">

                  <div className="flex justify-between gap-4">
                    <span>Transaction ID</span>

                    <span className="font-semibold text-gray-900">
                      #{String(transaction.id).padStart(5, "0")}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Date</span>

                    <span className="font-medium text-gray-900">
                      {formattedDate}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Time</span>

                    <span className="font-medium text-gray-900">
                      {formattedTime}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Branch</span>

                    <span className="font-medium text-right text-gray-900">
                      {transaction.branch.name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Cashier</span>

                    <span className="font-medium text-right text-gray-900">
                      {transaction.cashier.name}
                    </span>
                  </div>

                </div>

                {/* DIVIDER */}
                <div className="my-5 border-t border-dashed border-gray-300" />

                {/* ITEMS HEADER */}
                <div className="mb-3 grid grid-cols-[1fr_auto_auto] gap-3 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                  <span>Item</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Amount</span>
                </div>

                {/* ITEMS */}
                <div className="space-y-3">

                  {transaction.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_auto_auto] gap-3 text-[11px]"
                    >

                      {/* PRODUCT */}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {item.product}
                        </p>

                        <p className="mt-0.5 text-[9px] text-gray-400">
                          ₱{Number(item.price).toFixed(2)} each
                        </p>
                      </div>

                      {/* QUANTITY */}
                      <div className="text-center font-medium text-gray-600">
                        {item.quantity}
                      </div>

                      {/* SUBTOTAL */}
                      <div className="text-right font-semibold text-gray-900">
                        ₱{Number(item.subtotal).toFixed(2)}
                      </div>

                    </div>
                  ))}

                </div>

                {/* DIVIDER */}
                <div className="my-5 border-t border-dashed border-gray-300" />

                {/* PAYMENT */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">
                    Payment Method
                  </span>

                  <span className="font-semibold uppercase text-gray-900">
                    {transaction.paymentMethod}
                  </span>
                </div>

                {/* TOTAL */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-900 pt-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-gray-900">
                    ₱{Number(transaction.total).toFixed(2)}
                  </span>
                </div>

                {/* STATUS */}
                <div className="mt-5 flex items-center justify-center">

                  {transaction.status === "VOIDED" ? (
                    <span className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-red-600">
                      VOIDED
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-green-600">
                      COMPLETED
                    </span>
                  )}

                </div>

                {/* VOID REASON */}
                {transaction.status === "VOIDED" &&
                  transaction.voidReason && (
                    <div className="mt-4 border-t border-dashed border-gray-300 pt-3 text-center">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                        Void Reason
                      </p>

                      <p className="mt-1 text-[10px] text-gray-600">
                        {transaction.voidReason}
                      </p>
                    </div>
                  )}

                {/* FOOTER */}
                <div className="mt-6 border-t border-dashed border-gray-300 pt-5 text-center">

                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-gray-500">
                    Thank you for your purchase!
                  </p>

                  <p className="mt-1 text-[9px] text-gray-400">
                    Please keep this receipt for your records.
                  </p>

                </div>

              </div>
            ) : null}

          </div>

          {/* RECEIPT BOTTOM / PAPER EDGE */}
          <div
            className="h-3"
            style={{
              backgroundImage:
                "linear-gradient(135deg, transparent 5px, white 0) , linear-gradient(45deg, transparent 5px, white 0)",
              backgroundSize: "10px 10px",
              backgroundPosition: "0 0, 5px 0",
            }}
          />

        </div>
      </div>
    </div>
  );
}

export default TransactionDetailsModal;