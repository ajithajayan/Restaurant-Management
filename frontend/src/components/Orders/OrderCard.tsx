import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import { Order, Dish, CreditUser } from "../../types";
import OrderItems from "./OrderItems";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrderStatus";
import KitchenPrint from "./KitchenPrint";
import SalesPrint from "./SalesPrint";
import { useReactToPrint } from "react-to-print";
import { useLocation } from "react-router-dom";
import AddProductModal from "./AddProductModal";
import { api } from "../../services/api";
import ReactSelect from "react-select";
import { updateOrderStatusNew } from "../../services/api";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Button } from "../ui/button";
import { BadgeInfo, Bike, Mail, Phone, User } from "lucide-react";

interface OrderCardProps {
  order: Order;
  dishes: Dish[];
  creditUsers: CreditUser[];
}

const OrderCard: React.FC<OrderCardProps> = ({
  order: initialOrder,
  dishes,
  creditUsers,
}) => {
  const location = useLocation();
  const [status, setStatus] = useState(initialOrder.status);
  const { updateOrderStatus, isLoading: isUpdating } = useUpdateOrderStatus();
  const [showModal, setShowModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billType, setBillType] = useState<"kitchen" | "sales">("sales");
  const [paymentMethod, setPaymentMethod] = useState(
    initialOrder.payment_method || "cash"
  );
  const [cashAmount, setCashAmount] = useState(0);
  const [bankAmount, setBankAmount] = useState(0);
  const [order, setOrder] = useState<Order>(initialOrder);

  const kitchenPrintRef = useRef(null);
  const salesPrintRef = useRef(null);
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
          try {
            await updateOrderStatusNew(order.id, "delivered");
            setStatus("delivered");
            setShowAddProductModal(false);
            handlePrint();
            Swal.fire(
              "Success!",
              "The kitchen bill has been printed.",
              "success"
            );
          } catch (error) {
            console.error("Error updating status to delivered:", error);
            Swal.fire(
              "Error",
              "Failed to update status to delivered.",
              "error"
            );
          }
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
      } catch (error) {
        console.error("Error updating status:", error);
        setStatus(order.status); // Revert status if update failed
      }
    }
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

      Swal.fire(
        "Success!",
        "The order has been marked as delivered and payment method updated.",
        "success"
      );
    } catch (error) {
      console.error("Failed to update payment method and status:", error);
      Swal.fire(
        "Error",
        "Failed to process the payment and update status.",
        "error"
      );
    }
  };

  return (
    <div
      key={order.id}
      className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Order #{order.id}
        </h2>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
          {/* Print Icon for Kitchen and Sales Bills */}
          {(status === "approved" || status === "delivered") && (
            <button
              onClick={handlePrint}
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

          {/* <button
            onClick={() => setShowPaymentModal(true)}
            className={`w-full sm:w-auto bg-yellow-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-yellow-600 transition ${
              status === "delivered" || status === "cancelled"
                ? "cursor-not-allowed"
                : ""
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
                d="M4 12h16M4 6h16M4 18h16"
              ></path>
            </svg>
            Choose Payment
          </button> */}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Ordered on: {new Date(order.created_at).toLocaleString()}
      </p>
      <div className="space-y-3">
        {order.items.map((item, index) => (
          <OrderItems key={index} orderItem={item} dishes={dishes} />
        ))}
      </div>
      <div className="mt-4 flex justify-between items-center">
        {order.order_type === "delivery" && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link">
                <BadgeInfo size={16} className="mr-1" />
                <span>Delivery Status</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-48 p-4">
              <div className="space-y-2">
                {/* Delivery Status */}
                <div className="flex items-center space-x-2">
                  {order.delivery_order_status === "pending" ? (
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  ) : order.delivery_order_status === "delivered" ? (
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  ) : order.delivery_order_status === "accepted" ||
                    order.delivery_order_status === "in_progress" ? (
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                  <span className="text-sm font-semibold capitalize">
                    {order.delivery_order_status.replace("_", " ")}
                  </span>
                </div>

                {/* Delivery Driver Details */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Bike size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">
                      {order.delivery_driver.username}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">
                      {order.delivery_driver.mobile_number}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">
                      {order.delivery_driver.email}
                    </span>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex flex-col justify-between items-start pt-2 border-t mt-2">
                  <div>
                    <div className="text-sm font-bold">
                      {order.customer_phone_number}
                    </div>
                    <div className="text-sm font-bold">{order.address}</div>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        )}

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
                  options={creditUsers.map((user) => ({
                    value: user.id,
                    label: user.username,
                  }))}
                  onChange={(selectedOption) =>
                    setSelectedCreditUser(
                      creditUsers.find(
                        (user) => user.id === selectedOption?.value
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
