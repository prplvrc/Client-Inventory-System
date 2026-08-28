import { useEffect, useState } from "react";
import { X, Receipt, Calendar, Clock, User, CreditCard } from "lucide-react";
import { CardSkeleton } from "./LoadingSkeleton";

interface TransactionItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface TransactionDetails {
  id: number;
  date: string;
  time: string;
  cashier: string;
  items: TransactionItem[];
  total: number;
  paymentMethod: string;
}

interface TransactionDetailsModalProps {
  transactionId: number | null;
  onClose: () => void;
}

function TransactionDetailsModal({
  transactionId,
  onClose,
}: TransactionDetailsModalProps) {
  const [transaction, setTransaction] = useState<TransactionDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (transactionId === null) {
      setTransaction(null);
      return;
    }

    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) throw new Error("VITE_API_URL is not configured.");

        const response = await fetch(`${apiUrl}/sales/${transactionId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch transaction: ${response.status}`);
        }

        const result: TransactionDetails = await response.json();
        setTransaction(result);
      } catch (err) {
        console.error("Fetch transaction details error:", err);
        setError("Unable to load transaction details.");
        setTransaction(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  if (transactionId === null) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
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
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-200/60 hover:text-gray-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-5">
          {loading ? (
            <div className="space-y-5">
              <CardSkeleton lines={3} />
              <CardSkeleton lines={5} />
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center text-xs text-red-500">
              {error}
            </div>
          ) : transaction ? (
            <>
              {/* TRANSACTION NUMBER */}
              <div className="mb-4 rounded-lg bg-gray-50 p-3 text-center border border-gray-100">
                <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Transaction ID
                </span>
                <p className="text-lg font-bold text-gray-900">
                  #{String(transaction.id).padStart(5, "0")}
                </p>
              </div>

              {/* TRANSACTION METADATA */}
              <div className="mb-5 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 rounded-md border border-gray-100 bg-white p-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <span className="block text-[10px] uppercase text-gray-400">
                      Date
                    </span>
                    <span className="font-medium text-gray-700">
                      {transaction.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-md border border-gray-100 bg-white p-2">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <span className="block text-[10px] uppercase text-gray-400">
                      Time
                    </span>
                    <span className="font-medium text-gray-700">
                      {transaction.time}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-2 rounded-md border border-gray-100 bg-white p-2">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <span className="block text-[10px] uppercase text-gray-400">
                      Cashier
                    </span>
                    <span className="font-medium text-gray-700">
                      {transaction.cashier}
                    </span>
                  </div>
                </div>
              </div>

              {/* ITEMS TABLE */}
              <div className="mb-5 overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-gray-50 font-semibold uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {transaction.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          ₱{Number(item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SUMMARY BREAKDOWN */}
              <div className="space-y-2 rounded-lg bg-gray-50 p-3.5 border border-gray-100 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                    Payment Method
                  </span>
                  <span className="font-semibold text-gray-800">
                    {transaction.paymentMethod}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-sm font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-base text-gray-900">
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
