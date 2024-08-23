import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import { Order, Dish } from "../../types";
import OrderItems from "./OrderItems";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrderStatus";
import KitchenPrint from "./KitchenPrint";
import SalesPrint from "./SalesPrint";
import { useReactToPrint } from "react-to-print";
import { useLocation } from "react-router-dom";
import AddProductModal from "./AddProductModal";
import { api } from "../../services/api";

interface OrderCardProps {
  order: Order;
  dishes: Dish[];
}

const OrderCard: React.FC<OrderCardProps> = ({ order, dishes }) => {
  const location = useLocation();
  const [status, setStatus] = useState(order.status);
  const { updateOrderStatus, isLoading: isUpdating } = useUpdateOrderStatus();
  const [showModal, setShowModal] = useState(
    location.search.includes("showKitchenBill=true")
  );
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billType, setBillType] = useState<"kitchen" | "sales">("sales");
  const [paymentMethod, setPaymentMethod] = useState(order.payment_method || "cash");
  const [cashAmount, setCashAmount] = useState(0);
  const [bankAmount, setBankAmount] = useState(0);
  const kitchenPrintRef = useRef(null);
  const salesPrintRef = useRef(null);

  const newlyAddedItems = location.search.includes("showKitchenBill=true")
    ? order.items.filter((item) => item.is_new)
    : order.items;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Order["status"];
    setStatus(newStatus);

    if (newStatus === "approved") {
      setBillType("kitchen");
      setShowModal(true);
    } else if (newStatus === "delivered") {
      setBillType("sales");
      setShowModal(true);
    } else if (newStatus === "order_without_bill") {
      Swal.fire({
        title: "Continue without Bill?",
        text: "Do you want to continue without generating a bill?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, continue!",
        cancelButtonText: "No, go back",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setBillType("kitchen");
          await updateOrderStatus({ orderId: order.id, status: "delivered" });
          setStatus("delivered");
          setShowAddProductModal(false);
          handlePrint();
          Swal.fire("Success!", "The kitchen bill has been printed.", "success");
        }
      });
    } else if (newStatus === "cancelled") {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to cancel the order?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel it!",
        cancelButtonText: "No, keep it",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await updateOrderStatus({ orderId: order.id, status: "cancelled" });
            setStatus("cancelled");
            Swal.fire("Cancelled!", "The order has been cancelled.", "success");
          } catch (error) {
            Swal.fire("Error", "There was an error cancelling the order.", "error");
          }
        }
      });
    } else {
      setStatus(newStatus);
      updateOrderStatus({ orderId: order.id, status: newStatus });
    }
  };

  const handleAddProductSubmit = async (
    products: { dish: Dish; quantity: number }[]
  ) => {
    try {
      const newTotalAmount = products.reduce(
        (sum, product) => sum + product.quantity * product.dish.price,
        0
      ) + order.total_amount;

      const response = await api.put(`/orders/${order.id}/`, {
        items: products.map((product) => ({
          dish: product.dish.id,
          quantity: product.quantity,
          total_amount: product.quantity * product.dish.price,
        })),
        total_amount: newTotalAmount,
      });

      if (response.status === 200) {
        setShowAddProductModal(false);
        if (status === "approved") {
          handlePrint();
        }
      }
    } catch (error) {
      console.error("Failed to add products to the order:", error);
    }
  };

  const handlePrint = useReactToPrint({
    content: () =>
      billType === "kitchen" ? kitchenPrintRef.current : salesPrintRef.current,
  });

  const handleGenerate = () => {
    handlePrint();
    setShowModal(false);
    updateOrderStatus({ orderId: order.id, status });
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (method === "cash-bank") {
      setCashAmount(order.total_amount / 2); // Initial split for demonstration
      setBankAmount(order.total_amount / 2);
    } else {
      setCashAmount(order.total_amount);
      setBankAmount(0);
    }
  };

  const handleCashAmountChange = (amount: number) => {
    setCashAmount(amount);
    setBankAmount(order.total_amount - amount);
  };

  const handlePaymentSubmit = async () => {
    try {
      const response = await api.put(`/orders/${order.id}/`, {
        payment_method: paymentMethod,
        cash_amount: cashAmount,
        bank_amount: bankAmount,
      });

      if (response.status === 200) {
        setShowPaymentModal(false);
      }
    } catch (error) {
      console.error("Failed to update payment method:", error);
    }
  };

  return (
    <div key={order.id} className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Order #{order.id}</h2>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
          <select
            value={status}
            onChange={handleStatusChange}
            className="border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUpdating}
          >
            <option value="pending">Pending</option>
            <option value="approved">Kitchen Bill</option>
            <option value="cancelled">Cancelled</option>
            <option value="delivered">Order Success</option>
            <option value="order_without_bill">Order Without Bill</option>
          </select>
          <button
            onClick={() => setShowAddProductModal(true)}
            className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center transition 
            ${
              status === "delivered"
                ? "bg-gray-400 text-gray-200 cursor-not-allowed" // Disabled state styles
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`} // Enabled state styles
            disabled={status === "delivered"} // Disable button if order is delivered (including order_without_bill)
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

          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full sm:w-auto bg-yellow-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-yellow-600 transition"
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
                d="M4 12h16M4 6h16M4 18h16"
              ></path>
            </svg>
            Choose Payment
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Ordered on: {new Date(order.created_at).toLocaleString()}
      </p>
      <div className="space-y-3">
        {newlyAddedItems.map((item, index) => (
          <OrderItems key={index} orderItem={item} dishes={dishes} />
        ))}
      </div>
      <div className="mt-4 flex justify-end items-center">
        <span className="text-lg font-semibold text-gray-800">
          Total: QAR {order.total_amount}
        </span>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {billType === "kitchen" ? "Kitchen Bill" : "Sales Bill"}
            </h3>
            {status === "delivered" && (
              <select
                value={billType}
                onChange={(e) =>
                  setBillType(e.target.value as "kitchen" | "sales")
                }
                className="border rounded-md p-2 w-full mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sales">Sales Bill</option>
                <option value="kitchen">Kitchen Bill</option>
              </select>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
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

      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Choose Payment Method</h3>
            <select
              value={paymentMethod}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              className="border rounded-md p-2 w-full mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="cash-bank">Cash with Bank</option>
              <option value="credit">Credit</option>
            </select>

            {paymentMethod === "cash-bank" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Cash Amount</label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => handleCashAmountChange(Number(e.target.value))}
                    className="border rounded-md p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Bank Amount</label>
                  <input
                    type="number"
                    value={bankAmount}
                    readOnly
                    className="border rounded-md p-2 w-full text-gray-700 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden">
        <div ref={kitchenPrintRef}>
          <KitchenPrint
            order={{ ...order, items: newlyAddedItems }}
            dishes={dishes}
          />
        </div>
        <div ref={salesPrintRef}>
          <SalesPrint order={order} dishes={dishes} />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
