"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import SimplifiedSpendingRegistry from "../../../artifacts/contracts/SimplifiedSpendingRegistry.sol/SimplifiedSpendingRegistry.json";

export default function Dashboard() {
  const router = useRouter();
  const [contract, setContract] = useState(null);
  const [entityDetails, setEntityDetails] = useState(null);
  const [spendingRecords, setSpendingRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initContract = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"; // Your deployed contract address
          const contract = new ethers.Contract(
            contractAddress,
            SimplifiedSpendingRegistry.abi,
            signer
          );
          setContract(contract);

          // Get entity details
          const address = await signer.getAddress();
          const details = await contract.getEntityDetails(address);
          setEntityDetails(details);

          // Get spending records
          const records = await contract.getEntitySpendingRecords(
            address,
            0,
            5
          );
          setSpendingRecords(records);
        }
      } catch (error) {
        console.error("Error initializing contract:", error);
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Government Funds Dashboard
          </h1>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>

        {/* Entity Details Card */}
        {entityDetails && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Entity Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{entityDetails[0]}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p
                  className={`font-medium ${
                    entityDetails[1] ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {entityDetails[1] ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Balance</p>
                <p className="font-medium">
                  {ethers.formatEther(entityDetails[2])} ETH
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Spending Records */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Recent Spending Records
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {spendingRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.id.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ethers.formatEther(record.amount)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(
                        record.timestamp.toNumber() * 1000
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
