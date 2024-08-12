import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import { useBills } from "../hooks/useBills";
import BillCard from "../components/Bills/BillCard";
import PaginationControls from "../components/Layout/PaginationControls";
import { Bill } from "../types";

const BillsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: bills,
    isLoading: billsLoading,
    isError: billsError,
  } = useBills(currentPage);

  if (billsLoading) return <Layout>Loading bills...</Layout>;
  if (billsError) return <Layout>Error loading bills. Please try again later.</Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Generated Bills</h1>
      {bills?.results.length ? (
        <>
          {bills.results.map((bill: Bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(bills.count / 10)}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <p className="text-gray-600">No bills have been generated yet.</p>
      )}
    </Layout>
  );
};

export default BillsPage;
