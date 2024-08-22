import React, { useState, useRef } from "react";
import { Order, Dish } from "../../types";
import OrderItems from "./OrderItems";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrderStatus";
import KitchenPrint from "./KitchenPrint";
import SalesPrint from "./SalesPrint";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface OrderCardProps {
  order: Order;
  dishes: Dish[];
}

const OrderCard: React.FC<OrderCardProps> = ({ order, dishes }) => {
  const [status, setStatus] = useState(order.status);
  const { updateOrderStatus, isLoading: isUpdating } = useUpdateOrderStatus();
  const [showModal, setShowModal] = useState(false);
  const [billType, setBillType] = useState<"kitchen" | "sales">("sales");
  const kitchenPrintRef = useRef(null);
  const salesPrintRef = useRef(null);
  const navigate = useNavigate(); // Use useNavigate for navigation

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Order['status'];
    setStatus(newStatus);

    if (newStatus === "approved") {
      setBillType("kitchen");
      setShowModal(true);
    } else if (newStatus === "delivered") { // For "Order Success"
      setBillType("sales");
      setShowModal(true);
    } else {
      updateOrderStatus({ orderId: order.id, status: newStatus });
    }
  };

  const handleBillTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBillType(e.target.value as "kitchen" | "sales");
  };

  const handlePrint = useReactToPrint({
    content: () => (billType === "kitchen" ? kitchenPrintRef.current : salesPrintRef.current),
  });

  const handleGenerate = () => {
    handlePrint();
    setShowModal(false);
    updateOrderStatus({ orderId: order.id, status }); // Optionally update status after bill generation
  };

  const handleAddItems = () => {
    // Redirect to the product listing page, passing the current order ID
    navigate(`/products/add?orderId=${order.id}`);
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
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Ordered on: {new Date(order.created_at).toLocaleString()}
      </p>
      <div className="space-y-2">
        {order.items.map((item, index) => (
          <OrderItems key={index} orderItem={item} dishes={dishes} />
        ))}
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-lg font-semibold">
          Total: QAR {order.total_amount}
        </span>
        <button
          onClick={handleAddItems}
          className="bg-blue-500 text-white px-3 py-1 rounded flex items-center"
        >
          + Add Items
        </button>
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
                onChange={handleBillTypeChange}
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

      <div className="hidden">
        <div ref={kitchenPrintRef}>
          <KitchenPrint order={order} dishes={dishes} />
        </div>
        <div ref={salesPrintRef}>
          <SalesPrint order={order} dishes={dishes} />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
