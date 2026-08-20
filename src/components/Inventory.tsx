import { Search } from "lucide-react";

function Inventory() {
  return (
    <div className="ml-56 px-6 pt-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-gray-700">
          Manage your inventory items and keep track of stock levels.
        </p>
      </div>

      {/* Inventory Header / Controls */}
      <div className="mt-6 flex items-center gap-3">
        <h2 className="text-gray-700 font-semibold">
          Inventory List
        </h2>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Search by ID, ingredient, or status..."
            className="border border-gray-300 rounded-md py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button className="rounded-md border border-gray-300 bg-white text-black py-2 px-4 hover:bg-gray-100">
          Filter
        </button>

        <button className="rounded-md bg-blue-500 text-white py-2 px-4 hover:bg-blue-600">
          Add Item
        </button>
      </div>

      {/* Inventory Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-xs font-bold text-black">
                ID
              </th>
              <th className="border border-gray-300 px-4 py-2 text-xs font-bold text-black">
                INGREDIENT
              </th>
              <th className="border border-gray-300 px-4 py-2 text-xs font-bold text-black">
                UNIT
              </th>
              <th className="border border-gray-300 px-4 py-2 text-xs font-bold text-black">
                INITIAL STOCK
              </th>
              <th className="border border-gray-300 px-4 py-2 text-xs font-bold text-black">
                AVAILABLE STOCK
              </th>
              <th className="border border-gray-300 px-4 py-2 text-xs font-bold text-black">
                STATUS
              </th>
              <th className="border border-gray-300 px-4 py-2 text-xs font-bold text-black">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Inventory data will go here */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;