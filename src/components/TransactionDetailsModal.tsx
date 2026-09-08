import { useEffect, useState } from "react";
import {
  X,
  Receipt,
  Calendar,
  Clock,
  User,
  CreditCard,
} from "lucide-react";
import { CardSkeleton } from "./LoadingSkeleton";
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
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.message ||
              `Failed to fetch transaction: ${response.status}`
          );
        }

        const result: TransactionDetails = await response.json();

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

  // Format sale date
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
        hour12: false,
      })
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-gray-500" />

            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Transaction Details
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-200/60 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="max-h-[80vh] overflow-y-auto p-5">
          {/* LOADING */}
          {loading ? (
            <div className="space-y-5">
              <CardSkeleton lines={3} />
              <CardSkeleton lines={5} />
            </div>
          ) : error ? (
            /* ERROR */
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <Receipt className="mb-3 h-8 w-8 text-red-300" />

              <p className="text-xs font-medium text-red-500">
                Unable to load transaction
              </p>

              <p className="mt-1 max-w-xs text-[11px] text-gray-500">
                {error}
              </p>
            </div>
          ) : transaction ? (
            <>
              {/* TRANSACTION NUMBER */}
              <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Transaction ID
                </span>

                <p className="text-lg font-bold text-gray-900">
                  #{String(transaction.id).padStart(5, "0")}
                </p>
              </div>

              {/* TRANSACTION INFORMATION */}
              <div className="mb-5 grid grid-cols-2 gap-2 text-xs">
                {/* DATE */}
                <div className="flex items-center gap-2 rounded-md border border-gray-100 bg-white p-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />

                  <div>
                    <span className="block text-[10px] uppercase text-gray-400">
                      Date
                    </span>

                    <span className="font-medium text-gray-700">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* TIME */}
                <div className="flex items-center gap-2 rounded-md border border-gray-100 bg-white p-2">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />

                  <div>
                    <span className="block text-[10px] uppercase text-gray-400">
                      Time
                    </span>

                    <span className="font-medium text-gray-700">
                      {formattedTime}
                    </span>
                  </div>
                </div>

                {/* BRANCH */}
                <div className="col-span-2 rounded-md border border-gray-100 bg-white p-2">
                  <span className="block text-[10px] uppercase text-gray-400">
                    Branch
                  </span>

                  <span className="font-medium text-gray-700">
                    {transaction.branch.name}
                  </span>
                </div>

                {/* CASHIER */}
                <div className="col-span-2 flex items-center gap-2 rounded-md border border-gray-100 bg-white p-2">
                  <User className="h-3.5 w-3.5 text-gray-400" />

                  <div>
                    <span className="block text-[10px] uppercase text-gray-400">
                      Cashier
                    </span>

                    <span className="font-medium text-gray-700">
                      {transaction.cashier.name}
                    </span>

                    <span className="ml-2 text-[10px] text-gray-400">
                      @{transaction.cashier.username}
                    </span>
                  </div>
                </div>
              </div>

              {/* ITEMS */}
              <div className="mb-5 overflow-hidden rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                    Items
                  </h4>
                </div>

                <table className="w-full border-collapse text-left text-xs">
                  <thead className="border-b border-gray-200 bg-white font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2">
                        Item
                      </th>

                      <th className="px-3 py-2 text-center">
                        Qty
                      </th>

                      <th className="px-3 py-2 text-right">
                        Price
                      </th>

                      <th className="px-3 py-2 text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {transaction.items.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-gray-50/50"
                      >
                        {/* PRODUCT */}
                        <td className="px-3 py-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.product}
                            </p>

                            <p className="text-[9px] text-gray-400">
                              ID: #{item.productId}
                            </p>
                          </div>
                        </td>

                        {/* QUANTITY */}
                        <td className="px-3 py-2 text-center">
                          {item.quantity}
                        </td>

                        {/* PRICE */}
                        <td className="px-3 py-2 text-right">
                          ₱{Number(item.price).toFixed(2)}
                        </td>

                        {/* SUBTOTAL */}
                        <td className="px-3 py-2 text-right font-semibold text-gray-900">
                          ₱{Number(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SUMMARY */}
              <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3.5 text-xs">
                {/* PAYMENT METHOD */}
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-gray-400" />

                    Payment Method
                  </span>

                  <span className="rounded-full bg-gray-200 px-2 py-1 text-[10px] font-semibold text-gray-700">
                    {transaction.paymentMethod}
                  </span>
                </div>

                {/* TOTAL */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm font-bold text-gray-900">
                  <span>Total Amount</span>

                  <span className="text-base">
                    ₱{Number(transaction.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailsModal;