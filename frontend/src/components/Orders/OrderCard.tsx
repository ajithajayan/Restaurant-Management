import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { Order, Dish, CreditUser } from "../../types";
import OrderItems from "./OrderItems";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrderStatus";
import KitchenPrint from "./KitchenPrint";
import SalesPrint from "./SalesPrint";
import { useReactToPrint } from "react-to-print";
import AddProductModal from "./AddProductModal";
import {
  api,
  fetchActiveCreditUsers,
  updateOrderStatusNew,
} from "../../services/api";
import ReactSelect from "react-select";
import PrintConfirmationModal from "./PrintConfirmationModal";

interface OrderCardProps {
  order: Order;
  dishes: Dish[];
  creditUsers: CreditUser[];
  onCreditUserChange: () => void;
  selectedOrders: number[];
  onOrderSelection: (selectedOrderIds: number[]) => void;
  onStatusUpdated: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order: initialOrder,
  dishes,
  creditUsers,
  selectedOrders,
  onOrderSelection,
  onStatusUpdated, // Callback to refresh orders
  onCreditUserChange,
}) => {
  const [status, setStatus] = useState(initialOrder.status);
  const { updateOrderStatus, isLoading: isUpdating } = useUpdateOrderStatus();
  const [showModal, setShowModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billType, setBillType] = useState<"kitchen" | "sales">("kitchen");
  const [paymentMethod, setPaymentMethod] = useState(
    initialOrder.payment_method || "cash"
  );
  const [cashAmount, setCashAmount] = useState(0);
  const [bankAmount, setBankAmount] = useState(0);
  const [order, setOrder] = useState<Order>(initialOrder);
  const [showPrintConfirmationModal, setShowPrintConfirmationModal] =
    useState(false); // New state for print confirmation modal

  const kitchenPrintRef = useRef(null);
  const salesPrintRef = useRef(null);
  const [creditCardUsers, setCreditCardUsers] = useState<CreditUser[]>([]);
  const [selectedCreditUser, setSelectedCreditUser] =
    useState<CreditUser | null>(null);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as Order["status"];

    if (!order) {
      console.error("Order is undefined");
      return; // Exit if order is undefined
    }

    setStatus(newStatus);

    if (newStatus === "approved") {
      setBillType("kitchen");
      setShowModal(true);
      try {
        await updateOrderStatusNew(order.id, "approved");
        onStatusUpdated(); // Refresh orders after status change
      } catch (error) {
        console.error("Error updating status to approved:", error);
        Swal.fire("Error", "Failed to update status to approved.", "error");
      }
    } else if (newStatus === "delivered") {
      Swal.fire({
        title: "Choose Payment Method",
        text: "Please select a payment method before confirming the order.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Proceed",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          setShowPaymentModal(true);
        } else {
          setStatus(order.status); // Revert to previous status if canceled
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
            await updateOrderStatusNew(order.id, "cancelled");
            setStatus("cancelled");
            Swal.fire("Cancelled!", "The order has been cancelled.", "success");
            onStatusUpdated(); // Refresh orders after status change
          } catch (error) {
            console.error("Error cancelling order:", error);
            Swal.fire(
              "Error",
              "There was an error cancelling the order.",
              "error"
            );
          }
        } else {
          setStatus(order.status); // Revert to previous status if canceled
        }
      });
    } else {
      try {
        await updateOrderStatusNew(order.id, newStatus);
        onStatusUpdated(); // Refresh orders after status change
      } catch (error) {
        console.error("Error updating status:", error);
        setStatus(order.status); // Revert status if update failed
      }
    }
  };

  const handleOrderSelection = () => {
    onOrderSelection(
      selectedOrders.includes(order.id)
        ? selectedOrders.filter((id) => id !== order.id)
        : [...selectedOrders, order.id]
    );
  };

  const disableAllActions = () => {
    setShowModal(false);
    setShowAddProductModal(false);
    setShowPaymentModal(false);
  };

  const handleAddProductSubmit = async (
    products: { dish: Dish; quantity: number }[]
  ) => {
    try {
      const newTotalAmount = products.reduce(
        (sum, product) => sum + product.quantity * product.dish.price,
        order.total_amount // Start from the existing total amount
      );

      const response = await api.put(`/orders/${order.id}/`, {
        items: products.map((product) => ({
          dish: product.dish.id,
          quantity: product.quantity,
          total_amount: product.quantity * product.dish.price,
          is_newly_added: true, // Mark as newly added
        })),
        total_amount: parseFloat(newTotalAmount).toFixed(2),
      });

      if (response.status === 200) {
        setShowAddProductModal(false);

        // Fetch the updated order data after adding the product
        const updatedOrderResponse = await api.get(`/orders/${order.id}/`);
        if (updatedOrderResponse.status === 200) {
          const updatedOrder = updatedOrderResponse.data;
          setOrder(updatedOrder);
        }
        onStatusUpdated(); // Refresh orders after adding product
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
    onStatusUpdated(); // Refresh orders after status change
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (method === "cash-bank") {
      setCashAmount(order.total_amount / 2);
      setBankAmount(order.total_amount / 2);
    } else {
      setCashAmount(order.total_amount);
      setBankAmount(0);
    }
  };

  const handleCashAmountChange = (amount: number) => {
    if (amount < 0) {
      amount = 0;
    }
    if (amount > order.total_amount) {
      amount = order.total_amount;
    }
    setCashAmount(amount);
    setBankAmount(order.total_amount - amount);
  };

  const handlePaymentSubmit = async () => {
    try {
      // Prepare the payload to send to the API
      const additionalData = {
        payment_method: paymentMethod,
        cash_amount: paymentMethod === "cash-bank" ? cashAmount : undefined,
        bank_amount: paymentMethod === "cash-bank" ? bankAmount : undefined,
        credit_user_id:
          paymentMethod === "credit" && selectedCreditUser
            ? selectedCreditUser.id
            : undefined,
      };

      // Send the updated status and additional payment-related data to the API
      await updateOrderStatusNew(order.id, "delivered", additionalData);

      setShowPaymentModal(false);
      setStatus("delivered");
      disableAllActions();

      // Trigger the print confirmation modal
      setShowPrintConfirmationModal(true);

      // Trigger the order list refresh after payment submission
      onStatusUpdated(); // Refresh orders after status change
    } catch (error) {
      console.error("Failed to update payment method and status:", error);
      Swal.fire(
        "Error",
        "Failed to process the payment and update status.",
        "error"
      );
    }
  };

  const handlePrintConfirmation = () => {
    setBillType("sales");
    setShowModal(true); // Show the print modal
    setShowPrintConfirmationModal(false); // Close the print confirmation modal
  };

  return (
    <div
      key={order.id}
      className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedOrders.includes(order.id)}
            onChange={handleOrderSelection}
            className="mr-4 w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Order #{order.id}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
          {/* Print Icon for Kitchen and Sales Bills */}
          {/* Print Icon for Kitchen and Sales Bills */}
          {(status === "approved" || status === "delivered") && (
            <button
              onClick={() => {
                if (status === "approved") {
                  setBillType("kitchen");
                  setTimeout(() => handlePrint(), 0); // Ensure billType is updated before printing
                } else if (status === "delivered") {
                  setBillType("sales");
                  setTimeout(() => handlePrint(), 0); // Ensure billType is updated before printing
                }
              }}
              className="text-gray-700 hover:text-blue-500 focus:outline-none"
              title="Print Bill"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 9V2h12v7M6 18h12v5H6v-5zm2-3h8v3H8v-3zM6 11h12v4H6v-4z"
                ></path>
              </svg>
            </button>
          )}

          <select
            value={status}
            onChange={handleStatusChange}
            className="border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={
              isUpdating || status === "delivered" || status === "cancelled"
            } // Disable if order is delivered or cancelled
          >
            <option value="pending" disabled={status === "approved"}>
              Pending
            </option>
            <option value="approved">Kitchen Bill</option>
            <option value="cancelled">Cancelled</option>
            <option value="delivered">Order Success</option>
          </select>

          <button
            onClick={() => setShowAddProductModal(true)}
            className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center transition 
            ${
              status === "delivered" || status === "cancelled"
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={status === "delivered" || status === "cancelled"} // Disable if order is delivered or cancelled
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

      <p className="text-sm text-gray-500 mb-4">
        Ordered on: {new Date(order.created_at).toLocaleString()}
      </p>
      <div className="space-y-3">
        {order.items.map((item, index) => (
          <OrderItems
            key={index}
            orderItem={item}
            dishes={dishes}
            isNewlyAdded={item.is_newly_added} // Pass the newly added status
          />
        ))}
      </div>

      <div className="mt-4 flex justify-end items-center">
        <span className="text-lg font-semibold text-gray-800">
          Total: QAR {order.total_amount}
        </span>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
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
      {/* add product modal for adding products to the order */}

      {showAddProductModal && (
        <AddProductModal
          onClose={() => setShowAddProductModal(false)}
          onSubmit={handleAddProductSubmit}
        />
      )}

      {/* Add the PrintConfirmationModal */}
      <PrintConfirmationModal
        isOpen={showPrintConfirmationModal}
        onClose={() => setShowPrintConfirmationModal(false)}
        onPrint={handlePrintConfirmation}
      />

      {/* payment modal for updating payment methods */}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Choose Payment Method
            </h3>
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
                  <label className="block text-gray-700 mb-1">
                    Cash Amount
                  </label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) =>
                      handleCashAmountChange(Number(e.target.value))
                    }
                    className="border rounded-md p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    Bank Amount
                  </label>
                  <input
                    type="number"
                    value={bankAmount}
                    readOnly
                    className="border rounded-md p-2 w-full text-gray-700 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {paymentMethod === "credit" && (
              <div className="mt-4">
                <label className="block text-gray-700 mb-1">
                  Select Credit User
                </label>
                <ReactSelect
                  options={creditCardUsers.map((user) => ({
                    value: user.id,
                    label: user.username,
                  }))}
                  onChange={(selectedOption) =>
                    setSelectedCreditUser(
                      creditCardUsers.find(
                        (user) => user.id === selectedOption.value
                      ) || null
                    )
                  }
                  placeholder="Search for a credit user..."
                  isSearchable
                />
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
