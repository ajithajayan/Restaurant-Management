import React, { useState } from "react";
import { Order, Dish } from "../../types";
import OrderItems from "./OrderItems";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrderStatus";
import { useGenerateBill } from "../../hooks/useGenerateBill";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";

interface OrderCardProps {
  order: Order;
  dishes: Dish[];
}

const OrderCard: React.FC<OrderCardProps> = ({ order, dishes }) => {
  const [status, setStatus] = useState(order.status);
  const { updateOrderStatus, isLoading: isUpdating } = useUpdateOrderStatus();
  const [loading, setLoading] = useState(false)
  const { generateBill, isLoading: isGeneratingBill } = useGenerateBill();
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Order['status'];
    setStatus(newStatus);
    updateOrderStatus({ orderId: order.id, status: newStatus});
  };

  const handleGenerateBill = () => {
    setShowModal(true);
  };

  const handleSendPdf = async () => {
    setLoading(true);
    try {
      await api.post(`http://127.0.0.1:8000/orders/${order.id}/generate_and_send_pdf/`, { phone_number: phoneNumber });
      setShowModal(false);
      generateBill({ orderId: order.id, totalAmount: order.total_amount });
      setLoading(false)
      navigate("/bills");
    } catch (error) {
      setLoading(false)
      console.error("Error sending PDF:", error);
    }
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
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
            <option value="delivered">Delivered</option>
          </select>
          {status === 'delivered' && !order.bill_generated && (
            <button 
              onClick={handleGenerateBill}
              className="bg-green-500 text-white px-3 py-1 rounded"
              disabled={isGeneratingBill}
            >
              Generate Bill
            </button>
          )}
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
      <div className="mt-4 flex justify-end items-center">
        <span className="text-lg font-semibold">
          Total: QR{order.total_amount}
        </span>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Enter Phone Number</h3>
            <input 
              type="text"
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border rounded px-2 py-2 w-full mb-4"
              placeholder="Enter phone number"
            />
            <div className="flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded mr-2"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendPdf}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
