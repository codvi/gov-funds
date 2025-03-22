"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IPFSUpload from "@/components/IPFSUpload";
import addresses from "@/config/addresses.json";

export default function EntityDashboard() {
  // State declarations
  const [activeTab, setActiveTab] = useState("connection");
  const [connectionStatus, setConnectionStatus] = useState("Not Connected");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [entityInfo, setEntityInfo] = useState("");
  const [spendingRecords, setSpendingRecords] = useState("");
  const [fundRequests, setFundRequests] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [ethersModule, setEthersModule] = useState(null);

  // Contract configuration
  const contractAddress = addresses.contracts.main;
  const contractABI = [
    "function recordSpending(string memory purpose, uint256 amount, string memory documentHash) public",
    "function getEntityDetails(address entityAddress) public view returns (string memory name, bool isActive, uint256 balance)",
    "function getEntitySpendingRecords(address entityAddress, uint256 offset, uint256 limit) public view returns (tuple(uint256 id, address entity, string purpose, uint256 amount, string documentHash, uint256 timestamp)[] memory)",
    "function requestFunds(uint256 amount, string memory reason, string memory documentHash) public",
    "function getEntityFundRequests(address entityAddress, uint256 offset, uint256 limit) public view returns (tuple(uint256 id, address entity, uint256 amount, string reason, string documentHash, uint256 timestamp, bool isApproved, bool isRejected)[] memory)",
  ];

  // Get entity accounts from addresses.json
  const entityAccounts = Object.entries(addresses.accounts)
    .filter(([_, account]) => account.name.includes("Department"))
    .map(([address, account]) => ({
      address,
      name: account.name,
      privateKey: account.privateKey,
    }));

  // State for contract connection
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);

  // Connect to the contract
  const connectToContract = async () => {
    try {
      if (!selectedEntity) {
        throw new Error("Please select an entity account");
      }

      setIsLoading(true);
      setError("");

      // Connect to local Hardhat network
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

      // Get the private key for the selected entity
      const selectedAccount = entityAccounts.find(
        (acc) => acc.address === selectedEntity
      );
      if (!selectedAccount) {
        throw new Error("Selected entity not found");
      }

      const newSigner = new ethers.Wallet(selectedAccount.privateKey, provider);
      const newContract = new ethers.Contract(
        contractAddress,
        contractABI,
        newSigner
      );

      setSigner(newSigner);
      setContract(newContract);
      setConnectionStatus(`Connected as ${selectedAccount.name}`);
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionStatus(`Connection failed: ${error.message}`);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  // Get Entity Information
  const getEntityInfo = async () => {
    try {
      setIsLoading(true);
      setError("");

      // FIXED: removed ENS configuration
      const queryProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const queryContract = new ethers.Contract(
        contractAddress,
        contractABI,
        queryProvider
      );

      const [name, isActive, balance] = await queryContract.getEntityDetails(
        selectedEntity
      );
      setEntityInfo(`
        Name: ${name}<br>
        Active: ${isActive}<br>
        Balance: ${ethers.formatEther(balance)} ETH
      `);
    } catch (error) {
      setError(error.message);
      setEntityInfo("");
    } finally {
      setIsLoading(false);
    }
  };

  // Record Spending
  const recordSpending = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");

      const purpose = e.target.purpose.value;
      const amount = ethers.parseEther(e.target.amount.value);
      const documentHash = e.target.documentHash.value;

      const tx = await contract.recordSpending(purpose, amount, documentHash);
      await tx.wait();
      alert("Spending recorded successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get Spending Records
  const getSpendingRecords = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");

      const offset = parseInt(e.target.offset.value);
      const limit = parseInt(e.target.limit.value);
      const records = await contract.getEntitySpendingRecords(
        selectedEntity,
        offset,
        limit
      );

      let html = "";
      records.forEach((record) => {
        html += `
          ID: ${record.id.toString()}<br>
          Purpose: ${record.purpose}<br>
          Amount: ${ethers.formatEther(record.amount)} ETH<br>
          Document Hash: ${record.documentHash}<br>
          Timestamp: ${formatTimestamp(record.timestamp)}<br><br>
        `;
      });
      setSpendingRecords(html);
    } catch (error) {
      setError(error.message);
      setSpendingRecords("");
    } finally {
      setIsLoading(false);
    }
  };

  // Request Funds
  const requestFunds = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");

      const amount = ethers.parseEther(e.target.amount.value);
      const reason = e.target.reason.value;
      const documentHash = e.target.documentHash.value;

      const tx = await contract.requestFunds(amount, reason, documentHash);
      await tx.wait();
      alert("Fund request submitted successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get Fund Requests
  const getFundRequests = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");

      const offset = parseInt(e.target.offset.value);
      const limit = parseInt(e.target.limit.value);
      const requests = await contract.getEntityFundRequests(
        selectedEntity,
        offset,
        limit
      );

      let html = "";
      requests.forEach((request) => {
        html += `
          ID: ${request.id.toString()}<br>
          Amount: ${ethers.formatEther(request.amount)} ETH<br>
          Reason: ${request.reason}<br>
          Document Hash: ${request.documentHash}<br>
          Timestamp: ${formatTimestamp(request.timestamp)}<br>
          Status: ${
            request.isApproved
              ? "Approved"
              : request.isRejected
              ? "Rejected"
              : "Pending"
          }<br><br>
        `;
      });
      setFundRequests(html);
    } catch (error) {
      setError(error.message);
      setFundRequests("");
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation items
  const tabs = [
    { id: "connection", label: "Connect Wallet" },
    { id: "overview", label: "Overview" },
    { id: "funds", label: "Fund Management" },
    { id: "ipfs", label: "IPFS Upload" },
    { id: "spending", label: "Spending Records" },
    { id: "micro", label: "Micro-Transactions" },
    { id: "requests", label: "Fund Requests" },
    { id: "ratings", label: "Entity Ratings" },
  ];

  // Render section content based on active section
  const renderSectionContent = () => {
    switch (activeTab) {
      case "connection":
        return (
          <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-8 border border-gray-700/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Connection Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Entity Account
                </label>
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
                >
                  <option value="">Select an entity...</option>
                  {entityAccounts.map((account) => (
                    <option key={account.address} value={account.address}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className={`text-${
                  connectionStatus.includes("Connected") ? "green" : "gray"
                }-300 flex items-center`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${
                    connectionStatus.includes("Connected")
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-500"
                  }`}
                ></span>
                {connectionStatus}
              </div>
              <button
                onClick={connectToContract}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              >
                Connect as Selected Entity
              </button>
            </div>
          </div>
        );
      case "info":
        return (
          <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-8 border border-gray-700/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Entity Information
            </h2>
            <button
              onClick={getEntityInfo}
              className="bg-blue-600/20 text-blue-400 px-6 py-2 rounded-lg hover:bg-blue-600/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              Get Entity Information
            </button>
            <div
              className="mt-6 p-4 bg-gray-700/30 rounded-lg text-gray-300 border border-gray-600/50"
              dangerouslySetInnerHTML={{ __html: entityInfo }}
            />
          </div>
        );
      case "spending":
        return (
          <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-8 border border-gray-700/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Spending Management
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Record New Spending
                </label>
                <form onSubmit={recordSpending} className="space-y-4">
                  <input
                    type="text"
                    name="purpose"
                    placeholder="Purpose"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
                  />
                  <input
                    type="number"
                    name="amount"
                    placeholder="Amount (ETH)"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
                  />
                  <input
                    type="text"
                    name="documentHash"
                    placeholder="Document Hash"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    Record Spending
                  </button>
                </form>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  View Entity Spending Records
                </label>
                <form onSubmit={getSpendingRecords} className="space-y-4">
                  <div className="flex space-x-4">
                    <input
                      type="number"
                      name="offset"
                      placeholder="Offset"
                      defaultValue="0"
                      className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
                    />
                    <input
                      type="number"
                      name="limit"
                      placeholder="Limit"
                      defaultValue="5"
                      className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600/20 text-blue-400 px-6 py-2 rounded-lg hover:bg-blue-600/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    >
                      Query
                    </button>
                  </div>
                  <div
                    className="p-4 bg-gray-700/30 rounded-lg text-gray-300 border border-gray-600/50"
                    dangerouslySetInnerHTML={{ __html: spendingRecords }}
                  />
                </form>
              </div>
            </div>
          </div>
        );
      case "funds":
        return (
          <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-8 border border-gray-700/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Fund Request Management
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Request Funds from Central Government
                </label>
                <form onSubmit={requestFunds} className="space-y-4">
                  <input
                    type="number"
                    name="amount"
                    placeholder="Amount (ETH)"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
                  />
                  <input
                    type="text"
                    name="reason"
                    placeholder="Reason for Request"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
                  />
                  <input
                    type="text"
                    name="documentHash"
                    placeholder="Document Hash"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
                  />
                  <button
                    type="submit"
                    className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                  >
                    Submit Fund Request
                  </button>
                </form>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  View Fund Requests
                </label>
                <form onSubmit={getFundRequests} className="space-y-4">
                  <div className="flex space-x-4">
                    <input
                      type="number"
                      name="offset"
                      placeholder="Offset"
                      defaultValue="0"
                      className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
                    />
                    <input
                      type="number"
                      name="limit"
                      placeholder="Limit"
                      defaultValue="5"
                      className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600/20 text-blue-400 px-6 py-2 rounded-lg hover:bg-blue-600/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    >
                      Query
                    </button>
                  </div>
                  <div
                    className="p-4 bg-gray-700/30 rounded-lg text-gray-300 border border-gray-600/50"
                    dangerouslySetInnerHTML={{ __html: fundRequests }}
                  />
                </form>
              </div>
            </div>
          </div>
        );
      case "ipfs":
        return (
          <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-8 border border-gray-700/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              IPFS Document Upload
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IPFSUpload />
              <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">
                  IPFS Upload Guide
                </h3>
                <div className="space-y-4 text-gray-300">
                  <p>To upload documents to IPFS:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Select the document you want to upload</li>
                    <li>Click "Upload to IPFS"</li>
                    <li>Once uploaded, you'll receive an IPFS hash and URI</li>
                    <li>
                      Use the IPFS hash in your fund requests or spending
                      records
                    </li>
                  </ol>
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-400 mb-2">
                      Supported File Types:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>PDF Documents (.pdf)</li>
                      <li>Word Documents (.doc, .docx)</li>
                      <li>Text Files (.txt)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex">
        {/* Side Navigation */}
        <div className="w-64 bg-gray-800/30 backdrop-blur-md border-r border-gray-700/50 min-h-screen shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                  activeTab === "connection"
                    ? "bg-green-500"
                    : activeTab === "info"
                    ? "bg-blue-500"
                    : activeTab === "spending"
                    ? "bg-purple-500"
                    : activeTab === "funds"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
              ></span>
              Entity Dashboard
            </h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("connection")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === "connection"
                    ? "bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    : "text-gray-300 hover:bg-gray-700/50 hover:shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                }`}
              >
                Connection Status
              </button>
              <button
                onClick={() => setActiveTab("info")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === "info"
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    : "text-gray-300 hover:bg-gray-700/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                }`}
              >
                Entity Information
              </button>
              <button
                onClick={() => setActiveTab("spending")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === "spending"
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    : "text-gray-300 hover:bg-gray-700/50 hover:shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                }`}
              >
                Spending Management
              </button>
              <button
                onClick={() => setActiveTab("ipfs")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === "ipfs"
                    ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                    : "text-gray-300 hover:bg-gray-700/50 hover:shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                }`}
              >
                IPFS Upload
              </button>
              <button
                onClick={() => setActiveTab("funds")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === "funds"
                    ? "bg-yellow-600 text-white shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                    : "text-gray-300 hover:bg-gray-700/50 hover:shadow-[0_0_10px_rgba(234,179,8,0.1)]"
                }`}
              >
                Fund Requests
              </button>
            </nav>
            <div className="mt-8 pt-8 border-t border-gray-700/50">
              <a
                href="/"
                className="block text-center text-blue-400 hover:text-blue-300 transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]"
              >
                Back to Role Selection
              </a>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto py-6 px-8">
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                {error}
              </div>
            )}
            {renderSectionContent()}
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div
              className={`inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)] ${
                activeTab === "connection"
                  ? "border-green-500"
                  : activeTab === "info"
                  ? "border-blue-500"
                  : activeTab === "spending"
                  ? "border-purple-500"
                  : activeTab === "funds"
                  ? "border-yellow-500"
                  : "border-blue-500"
              }`}
            ></div>
            <p className="mt-4 text-gray-300">Processing transaction...</p>
          </div>
        </div>
      )}
    </div>
  );
}
