import React from "react";
import { Minus, Plus, X } from "lucide-react";

const OrderItem: React.FC<any> = ({
  orderItem,
  incrementQuantity,
  decrementQuantity,
  removeItem,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center bg-blue-50 p-4 rounded-lg mb-2">
      <button
        className="text-red-500 rounded-full p-1 mr-2"
        onClick={() => removeItem(orderItem.id!)}
      >
        <X size={16} />
      </button>
      <img
        src={orderItem ? orderItem.image : "/placeholder-image.png"}
        alt={orderItem ? orderItem.name : "Dish"}
        className="w-12 h-12 object-cover rounded"
      />
      <div className="flex-grow ml-4">
        <h4 className="font-semibold">
          {orderItem ? orderItem.name : "Loading..."}
        </h4>
        <span className="text-red-500">
          QAR {orderItem ? orderItem.price : "0.00"}
        </span>
      </div>
      <div>
        <div className="flex items-center">
          <button
            className="text-white border rounded-full p-1 bg-gray-600"
            onClick={() => decrementQuantity(orderItem.id!)}
          >
            <Minus size={16} />
          </button>
          <span className="mx-2">x{orderItem.quantity}</span>
          <button
            className="text-white border rounded-full p-1 bg-red-500"
            onClick={() => incrementQuantity(orderItem.id!)}
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="font-semibold text-lg flex justify-center mt-2">
          QR
          {orderItem
            ? (orderItem.price * orderItem.quantity).toFixed(2)
            : "0.00"}
        </span>
      </div>
    </div>
  );
};

export default OrderItem;
