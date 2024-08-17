import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import PaginationControls from "../components/Layout/PaginationControls";

interface OrderItem {
  dish: number;
  quantity: number;
}

interface SalesReport {
  id: number;
  total_amount: number;
  status: string;
  order_type: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

const SalesReportPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("day");
  const [filteredReports, setFilteredReports] = useState<SalesReport[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReports(selectedPeriod);
  }, [selectedPeriod]);

  const fetchReports = async (period: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/api/orders/sales_report?time_range=${period}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const data: SalesReport[] = await response.json();
          setFilteredReports(data);
          setCurrentPage(1);
        } else {
          const text = await response.text();
          console.error("Unexpected content type:", contentType);
          console.error("Response body:", text);
        }
      } else {
        console.error("HTTP error! status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const calculateTotalQuantity = (items: OrderItem[]): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-4 mb-4">
          {["day", "week", "month", "year"].map((period) => (
            <div
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`p-4 rounded-lg shadow-md cursor-pointer ${
                selectedPeriod === period ? "bg-purple-500 text-white" : "bg-gray-200"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Type</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{report.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">QAR {report.total_amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.order_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.payment_method}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(report.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {calculateTotalQuantity(report.items)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(filteredReports.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </Layout>
  );
};

export default SalesReportPage;
