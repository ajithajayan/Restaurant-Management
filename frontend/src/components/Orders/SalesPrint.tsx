import React from "react";
import { Order, Dish } from "../../types";

interface SalesPrintProps {
  order: Order;
  dishes: Dish[];
}

const SalesPrint: React.FC<SalesPrintProps> = ({ order, dishes }) => {
  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return date.toLocaleTimeString(undefined, options);
  };

  const totalQuantity = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="print-container w-64 p-4 text-sm bg-white border-2 border-dashed rounded-lg mx-auto">
      <h1 className="text-center text-lg font-bold mb-2">Sales Receipt</h1>
      <div className="print-order-id mb-2">Order_id #{order.id}</div>
      <div className="print-date mb-2">Date: {formatDate(order.created_at)}</div>
      <div className="print-time mb-2">Time: {formatTime(order.created_at)}</div>
      <div className="print-items">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Item</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => {
              const dish = dishes.find(dish => dish.id === item.dish);
              return (
                <tr key={index} className="print-item">
                  <td className="print-item-name">{dish ? dish.name : 'Unknown Dish'}</td>
                  <td className="print-item-quantity text-center">{item.quantity}x</td>
                  <td className="print-item-price text-right">QAR {dish ? dish.price * item.quantity : 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="print-summary mt-4 text-right">
        <div className="print-total-quantity">Total Quantity: {totalQuantity}</div>
        <div className="print-total-amount font-bold">Total Amount: QAR {order.total_amount}</div>
      </div>
    </div>
  );
};

export default SalesPrint;
