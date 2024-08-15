import React from "react";
import { Pencil } from 'lucide-react';

const MessMembers: React.FC = () => {
  const members = [
    {
      customer_name: "John Doe",
      mobile_number: "1234567890",
      start_date: "2023-01-01",
      end_date: "2023-01-31",
      mess_type: "combo",
      total_price: "100",
      payment_method: "Bank",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 border-b text-left">Customer Name</th>
            <th className="py-2 px-4 border-b text-left">Mobile</th>
            <th className="py-2 px-4 border-b text-left">Start Date</th>
            <th className="py-2 px-4 border-b text-left">End Date</th>
            <th className="py-2 px-4 border-b text-left">Mess Type</th>
            <th className="py-2 px-4 border-b text-left">Total</th>
            <th className="py-2 px-4 border-b text-left">Payment Method</th>
            <th className="py-2 px-4 border-b text-left">Edit</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b">{member.customer_name}</td>
              <td className="py-2 px-4 border-b">{member.mobile_number}</td>
              <td className="py-2 px-4 border-b">{member.start_date}</td>
              <td className="py-2 px-4 border-b">{member.end_date}</td>
              <td className="py-2 px-4 border-b">{member.mess_type}</td>
              <td className="py-2 px-4 border-b">QR{member.total_price}</td>
              <td className="py-2 px-4 border-b">{member.payment_method}</td>
              <td className="py-2 px-4 border-b">
                <button className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-700">
                <Pencil />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MessMembers;
