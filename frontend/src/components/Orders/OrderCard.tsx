import React, { useState, useRef } from "react";
import { Order, Dish } from "../../types";
import OrderItems from "./OrderItems";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrderStatus";
import KitchenPrint from "./KitchenPrint";
import SalesPrint from "./SalesPrint";
import { useReactToPrint } from "react-to-print";
import { useLocation } from "react-router-dom";
import AddProductModal from "./AddProductModal";
import { api } from "../../services/api"; // Import your API service

interface OrderCardProps {
  order: Order;
  dishes: Dish[];
}

const OrderCard: React.FC<OrderCardProps> = ({ order, dishes }) => {
  const location = useLocation();
  const [status, setStatus] = useState(order.status);
  const { updateOrderStatus, isLoading: isUpdating } = useUpdateOrderStatus();
  const [showModal, setShowModal] = useState(location.search.includes("showKitchenBill=true"));
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [billType, setBillType] = useState<"kitchen" | "sales">("sales");
  const kitchenPrintRef = useRef(null);
  const salesPrintRef = useRef(null);

  const newlyAddedItems = location.search.includes("showKitchenBill=true")
    ? order.items.filter((item) => item.is_new)
    : order.items;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Order["status"];
    setStatus(newStatus);

    if (newStatus === "approved") {
      setBillType("kitchen");
      setShowModal(true);
    } else if (newStatus === "delivered") {
      setBillType("sales");
      setShowModal(true);
    } else {
      updateOrderStatus({ orderId: order.id, status: newStatus });
    }
  };

  const handleAddProductSubmit = async (products: { dish: Dish; quantity: number }[]) => {
    // Assuming the backend API endpoint for updating the order is something like `/api/orders/<order_id>/`
    try {
      const response = await api.put(`/api/orders/${order.id}/`, {
        items: products.map(product => ({
          dish: product.dish.id,
          quantity: product.quantity,
        })),
      });

      // Handle response, update local state if necessary
      if (response.status === 200) {
        setShowAddProductModal(false);
        // Optionally, trigger the kitchen print if the order is approved for the kitchen
        if (status === "approved") {
          handlePrint();
        }
      }
    } catch (error) {
      console.error("Failed to add products to the order:", error);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => (billType === "kitchen" ? kitchenPrintRef.current : salesPrintRef.current),
  });

  const handleGenerate = () => {
    handlePrint();
    setShowModal(false);
    updateOrderStatus({ orderId: order.id, status });
  };

  return (
    <div key={order.id} className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Order #{order.id}</h2>
        <div className="flex items-center space-x-2">
          <select
            value={status}
            onChange={handleStatusChange}
            className="border rounded p-1"
            disabled={isUpdating}
          >
            <option value="pending">Pending</option>
            <option value="approved">Kitchen Bill</option>
            <option value="cancelled">Cancelled</option>
            <option value="delivered">Order Success</option>
          </select>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="bg-blue-500 text-white px-3 py-1 rounded flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Add Product
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Ordered on: {new Date(order.created_at).toLocaleString()}
      </p>
      <div className="space-y-2">
        {newlyAddedItems.map((item, index) => (
          <OrderItems key={index} orderItem={item} dishes={dishes} />
        ))}
      </div>
      <div className="mt-4 flex justify-end items-center">
        <span className="text-lg font-semibold">
          Total: QAR {order.total_amount}
        </span>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {billType === "kitchen" ? "Kitchen Bill" : "Sales Bill"}
            </h3>
            {status === "delivered" && (
              <select
                value={billType}
                onChange={(e) => setBillType(e.target.value as "kitchen" | "sales")}
                className="border rounded px-2 py-2 w-full mb-4"
              >
                <option value="sales">Sales Bill</option>
                <option value="kitchen">Kitchen Bill</option>
              </select>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="bg-green-500 text-white px-3 py-1 rounded"
                disabled={!billType}
              >
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddProductModal && (
        <AddProductModal
          onClose={() => setShowAddProductModal(false)}
          onSubmit={handleAddProductSubmit}
        />
      )}

      <div className="hidden">
        <div ref={kitchenPrintRef}>
          <KitchenPrint order={{ ...order, items: newlyAddedItems }} dishes={dishes} />
        </div>
        <div ref={salesPrintRef}>
          <SalesPrint order={order} dishes={dishes} />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
