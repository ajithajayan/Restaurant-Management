import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import axios from "axios";
import EditMessModal from "./EditMessModal";

interface Member {
  id: number;
  customer_name: string;
  mobile_number: string;
  start_date: string;
  end_date: string;
  mess_type: string;
  total_price: string;
  payment_method: string;
  paid_amount?: string;
  pending_amount?: string;
  total_amount:string;
}

const MessMembers: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/messes/");
        if (response.data && Array.isArray(response.data.results)) {
          setMembers(response.data.results);
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Unexpected data format from API");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleEditClick = (member: Member) => {
    setCurrentMember(member);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentMember(null);
  };

  const handleSave = (updatedMember: Member) => {
    // Update member data in state
    setMembers((prevMembers) =>
      prevMembers.map((member) => (member.id === updatedMember.id ? updatedMember : member))
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 border-b text-left">Name</th>
            <th className="py-2 px-4 border-b text-left">Mobile</th>
            <th className="py-2 px-4 border-b text-left">Start Date</th>
            <th className="py-2 px-4 border-b text-left">End Date</th>
            <th className="py-2 px-4 border-b text-left">Paid</th>
            <th className="py-2 px-4 border-b text-left">Pending</th>
            <th className="py-2 px-4 border-b text-left">Total</th>
            <th className="py-2 px-4 border-b text-left">Payment Method</th>
            <th className="py-2 px-4 border-b text-left">Edit</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b">{member.customer_name}</td>
              <td className="py-2 px-4 border-b">{member.mobile_number}</td>
              <td className="py-2 px-4 border-b">{member.start_date}</td>
              <td className="py-2 px-4 border-b">{member.end_date}</td>
              <td className="py-2 px-4 border-b">QR{member.paid_amount}</td>
              <td className="py-2 px-4 border-b">QR{member.pending_amount}</td>
              <td className="py-2 px-4 border-b">QR{member.total_amount}</td>
              <td className="py-2 px-4 border-b">{member.payment_method}</td>
              <td className="py-2 px-4 border-b">
                <button
                  className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-700"
                  onClick={() => handleEditClick(member)}
                >
                  <Pencil />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && currentMember && (
        <EditMessModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          member={currentMember}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default MessMembers;
