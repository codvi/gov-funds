"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { usePathname } from "next/navigation";
import IPFSUpload from "@/components/IPFSUpload";
import addresses from "@/config/addresses.json";

export default function AuditPage() {
  const [selectedAuditor, setSelectedAuditor] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  // State for different sections
  const [issuedFunds, setIssuedFunds] = useState([]);
  const [spendingRecords, setSpendingRecords] = useState([]);
  const [microTransactions, setMicroTransactions] = useState([]);
  const [fundRequests, setFundRequests] = useState([]);
  const [entityRatings, setEntityRatings] = useState([]);
  const [bonusTime, setBonusTime] = useState(null);

  const pathname = usePathname();

  // Navigation items
  const sidebarLinks = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "funds", label: "Fund Issuance", icon: "💰" },
    { id: "spending", label: "Spending Records", icon: "📝" },
    { id: "micro", label: "Micro-Transactions", icon: "🔍" },
    { id: "requests", label: "Fund Requests", icon: "📨" },
    { id: "ratings", label: "Entity Ratings", icon: "⭐" },
  ];

  // Contract configuration
  const contractAddress = addresses.contracts.main;
  const contractABI = [
    "function getIssuedFunds(uint256 offset, uint256 limit) public view returns (tuple(uint256 id, address entity, uint256 amount, uint256 timestamp)[] memory)",
    "function getSpendingRecords(uint256 offset, uint256 limit) public view returns (tuple(uint256 id, address entity, string purpose, uint256 amount, string documentHash, uint256 timestamp)[] memory)",
    "function getFundRequests(uint256 offset, uint256 limit) public view returns (tuple(uint256 id, address entity, uint256 amount, string reason, string documentHash, uint256 timestamp, bool isApproved, bool isRejected)[] memory)",
    "function getAllEntityRatings() public view returns (address[] memory addresses, uint256[] memory ratings, uint256[] memory votes)",
    "function getTimeUntilNextBonus() public view returns (uint256)",
    "function getMicroTransactions(uint256 offset, uint256 limit) public view returns (tuple(uint256 id, uint256 spendingRecordId, address entity, string description, uint256 amount, uint256 timestamp)[] memory)",
  ];

  // Get auditor account from addresses.json
  const auditorAccount = Object.entries(addresses.accounts).find(
    ([_, account]) => account.name === "Auditor"
  );

  // Helper function to format error messages
  const formatErrorMessage = (error) => {
    // Network related errors
    if (error.message.includes("network")) {
      return {
        title: "Network Connection Error",
        message:
          "Unable to connect to the blockchain network. Please check your internet connection and try again.",
        type: "error",
      };
    }

    // Contract interaction errors
    if (error.message.includes("contract")) {
      return {
        title: "Smart Contract Error",
        message:
          "There was an error interacting with the smart contract. Please try again later.",
        type: "error",
      };
    }

    // Account selection errors
    if (
      error.message.includes("account") ||
      error.message.includes("selected")
    ) {
      return {
        title: "Account Selection Required",
        message: "Please select an auditor account before proceeding.",
        type: "warning",
      };
    }

    // Transaction errors
    if (error.message.includes("transaction")) {
      return {
        title: "Transaction Failed",
        message: "The transaction could not be completed. Please try again.",
        type: "error",
      };
    }

    // Provider errors
    if (error.message.includes("provider")) {
      return {
        title: "Connection Error",
        message:
          "Unable to connect to the blockchain provider. Please ensure you have MetaMask installed and try again.",
        type: "error",
      };
    }

    // Fallback for unknown errors
    return {
      title: "Unexpected Error",
      message:
        "An unexpected error occurred. Please try again or contact support if the problem persists.",
      type: "error",
    };
  };

  // Connect to the contract
  const connectToContract = async () => {
    try {
      if (!selectedAuditor) {
        throw new Error("Please select an auditor account");
      }

      setIsLoading(true);
      setError("");

      // Connect to local Hardhat network
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

      // Get the private key for the selected auditor
      const [address, account] = auditorAccount;
      if (!account) {
        throw new Error("Auditor account not found");
      }

      const newSigner = new ethers.Wallet(account.privateKey, provider);
      const newContract = new ethers.Contract(
        contractAddress,
        contractABI,
        newSigner
      );

      setSigner(newSigner);
      setContract(newContract);
      setConnectionStatus(`Connected as ${account.name}`);
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionStatus(`Connection failed: ${error.message}`);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Data fetching functions
  const getIssuedFunds = async (offset = 0, limit = 10) => {
    try {
      if (!contract) throw new Error("contract_not_connected");
      setIsLoading(true);
      const funds = await contract.getIssuedFunds(offset, limit);
      setIssuedFunds(funds);
    } catch (error) {
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getSpendingRecords = async (offset = 0, limit = 10) => {
    try {
      setIsLoading(true);
      const records = await contract.getSpendingRecords(offset, limit);
      setSpendingRecords(records);
    } catch (error) {
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getMicroTransactions = async (offset = 0, limit = 10) => {
    try {
      setIsLoading(true);
      const transactions = await contract.getMicroTransactions(offset, limit);
      setMicroTransactions(transactions);
    } catch (error) {
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getFundRequests = async (offset = 0, limit = 10) => {
    try {
      setIsLoading(true);
      const requests = await contract.getFundRequests(offset, limit);
      setFundRequests(requests);
    } catch (error) {
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getEntityRatings = async () => {
    try {
      setIsLoading(true);
      const [addresses, ratings, votes] = await contract.getAllEntityRatings();
      setEntityRatings(
        addresses.map((address, i) => ({
          address,
          rating: ratings[i].toString(),
          votes: votes[i].toString(),
        }))
      );
    } catch (error) {
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getBonusTime = async () => {
    try {
      setIsLoading(true);
      const timeUntilBonus = await contract.getTimeUntilNextBonus();
      const hours = Math.floor(timeUntilBonus / 3600);
      const minutes = Math.floor((timeUntilBonus % 3600) / 60);
      setBonusTime({ hours, minutes });
    } catch (error) {
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Render section content based on active section
  const renderSectionContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Funds Issued</span>
                  <span className="text-blue-400">{issuedFunds.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Requests</span>
                  <span className="text-blue-400">
                    {
                      fundRequests.filter((r) => !r.isApproved && !r.isRejected)
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Transactions</span>
                  <span className="text-blue-400">
                    {spendingRecords.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-4">
                Performance Overview
              </h3>
              {bonusTime && (
                <div className="text-center">
                  <p className="text-gray-400 mb-2">
                    Next Bonus Distribution in:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-yellow-400">
                        {bonusTime.hours}
                      </p>
                      <p className="text-sm text-gray-400">Hours</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-yellow-400">
                        {bonusTime.minutes}
                      </p>
                      <p className="text-sm text-gray-400">Minutes</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "funds":
        return (
          <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Fund Issuance Records
              </h3>
              <button
                onClick={() => getIssuedFunds()}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
              >
                Refresh Data
              </button>
            </div>
            <div className="space-y-4">
              {issuedFunds.map((fund, index) => (
                <div
                  key={index}
                  className="bg-gray-700/30 rounded-lg p-4 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-gray-300 truncate">
                        ID: {fund.id.toString()}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
                        Entity: {fund.entity}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-blue-400 font-semibold">
                        {ethers.formatEther(fund.amount)} ETH
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(
                          Number(fund.timestamp) * 1000
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "spending":
        return (
          <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Spending Records
              </h3>
              <button
                onClick={() => getSpendingRecords()}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
              >
                Refresh Data
              </button>
            </div>
            <div className="space-y-4">
              {spendingRecords.map((record, index) => (
                <div
                  key={index}
                  className="bg-gray-700/30 rounded-lg p-4 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <p className="text-gray-300 truncate">
                        ID: {record.id.toString()}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
                        Entity: {record.entity}
                      </p>
                      <p className="text-gray-400 truncate">{record.purpose}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-blue-400 font-semibold">
                        {ethers.formatEther(record.amount)} ETH
                      </p>
                      <p className="text-gray-500 text-sm truncate">
                        Hash: {record.documentHash.slice(0, 10)}...
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(
                          Number(record.timestamp) * 1000
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "micro":
        return (
          <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Micro-Transactions
              </h3>
              <button
                onClick={() => getMicroTransactions()}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
              >
                Refresh Data
              </button>
            </div>
            <div className="space-y-4">
              {microTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="bg-gray-700/30 rounded-lg p-4 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <p className="text-gray-300 truncate">
                        ID: {tx.id.toString()}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
                        Record ID: {tx.spendingRecordId.toString()}
                      </p>
                      <p className="text-gray-400 truncate">{tx.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-blue-400 font-semibold">
                        {ethers.formatEther(tx.amount)} ETH
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(Number(tx.timestamp) * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "requests":
        return (
          <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Fund Requests
              </h3>
              <button
                onClick={() => getFundRequests()}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
              >
                Refresh Data
              </button>
            </div>
            <div className="space-y-4">
              {fundRequests.map((request, index) => (
                <div
                  key={index}
                  className="bg-gray-700/30 rounded-lg p-4 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <p className="text-gray-300 truncate">
                        ID: {request.id.toString()}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
                        Entity: {request.entity}
                      </p>
                      <p className="text-gray-400 truncate">{request.reason}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-blue-400 font-semibold">
                        {ethers.formatEther(request.amount)} ETH
                      </p>
                      <p
                        className={`text-sm ${
                          request.isApproved
                            ? "text-green-400"
                            : request.isRejected
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {request.isApproved
                          ? "Approved"
                          : request.isRejected
                          ? "Rejected"
                          : "Pending"}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(
                          Number(request.timestamp) * 1000
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "ratings":
        return (
          <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Entity Ratings
              </h3>
              <button
                onClick={getEntityRatings}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
              >
                Refresh Data
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entityRatings.map((rating, index) => (
                <div
                  key={index}
                  className="bg-gray-700/30 rounded-lg p-4 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300"
                >
                  <p className="text-gray-300 mb-2 truncate">
                    Entity: {rating.address}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                        style={{ width: `${(rating.rating / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-yellow-400 font-semibold flex-shrink-0">
                      {rating.rating}/5
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Total Votes: {rating.votes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-800/40 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Transaction Audit Dashboard
            </h1>
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Back to Role Selection</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800/40 backdrop-blur-md border-r border-gray-700/50 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Account Selection */}
          <div className="p-4 border-b border-gray-700/50">
            <h5 className="font-semibold text-white mb-3">
              Select Auditor Account
            </h5>
            <select
              value={selectedAuditor}
              onChange={(e) => setSelectedAuditor(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-500/50"
            >
              <option value="">Select an auditor...</option>
              {auditorAccount && (
                <option value={auditorAccount[0]}>
                  {auditorAccount[1].name}
                </option>
              )}
            </select>
            <button
              onClick={connectToContract}
              className="w-full mt-3 bg-blue-500/80 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={!selectedAuditor || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Connect as Auditor</span>
                </>
              )}
            </button>
            {connectionStatus && (
              <div
                className={`mt-3 p-3 rounded-lg text-sm ${
                  connectionStatus.type === "error"
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : connectionStatus.type === "success"
                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                    : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                }`}
              >
                {connectionStatus.message}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="p-4">
            <div className="space-y-2">
              {sidebarLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveSection(link.id)}
                  className={`flex items-center w-full space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === link.id
                      ? "bg-blue-500/80 text-white shadow-lg shadow-blue-500/20"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {!contract ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-8 border border-gray-700/50 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Welcome to the Audit Dashboard
                </h2>
                <p className="text-gray-300 mb-6">
                  Please select an auditor account and connect to access the
                  dashboard features.
                </p>
                <div className="flex justify-center">
                  <span className="text-6xl">👥</span>
                </div>
              </div>
            </div>
          ) : (
            renderSectionContent()
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 p-8 rounded-xl border border-gray-700/50 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/50 border-t-blue-500 mx-auto"></div>
            <p className="mt-4 text-white font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          className={`fixed bottom-4 right-4 max-w-md backdrop-blur-md border px-6 py-4 rounded-xl shadow-xl transition-all duration-300 z-50 ${
            error.type === "error"
              ? "bg-red-900/50 border-red-500/30 text-red-200"
              : error.type === "warning"
              ? "bg-yellow-900/50 border-yellow-500/30 text-yellow-200"
              : "bg-green-900/50 border-green-500/30 text-green-200"
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 pt-0.5">
              {error.type === "error" && (
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {error.type === "warning" && (
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {error.type === "success" && (
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-1">{error.title}</h3>
              <p className="text-sm opacity-90">{error.message}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 ml-4 -mr-2 mt-0.5 text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
