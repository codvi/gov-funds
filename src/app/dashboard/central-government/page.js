"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Dynamically import ethers to avoid SSR issues
const ethers = dynamic(() => import('ethers'), { ssr: false });

export default function CentralGovernmentDashboard() {
  const router = useRouter();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Not Connected");
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Form states
  const [entityAddress, setEntityAddress] = useState("");
  const [entityName, setEntityName] = useState("");
  const [entityType, setEntityType] = useState("");
  const [entityDescription, setEntityDescription] = useState("");
  const [entityContact, setEntityContact] = useState("");
  const [entityBudget, setEntityBudget] = useState("");
  const [deactivateAddress, setDeactivateAddress] = useState("");
  const [fundAddress, setFundAddress] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [queryAddress, setQueryAddress] = useState("");
  const [spendingOffset, setSpendingOffset] = useState("0");
  const [spendingLimit, setSpendingLimit] = useState("5");
  const [requestId, setRequestId] = useState("");
  const [fundRequestOffset, setFundRequestOffset] = useState("0");
  const [fundRequestLimit, setFundRequestLimit] = useState("5");

  // Result states
  const [entityDetailsResult, setEntityDetailsResult] = useState("");
  const [allEntitiesResult, setAllEntitiesResult] = useState("");
  const [spendingRecordsResult, setSpendingRecordsResult] = useState("");
  const [contractBalanceResult, setContractBalanceResult] = useState("");
  const [allFundRequestsResult, setAllFundRequestsResult] = useState("");

  // New state for active section
  const [activeSection, setActiveSection] = useState("entity");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const connectToContract = async () => {
    if (!isClient) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Connect to local Hardhat network with explicit network configuration
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545", {
        name: "hardhat",
        chainId: 31337,
      });

      // Disable ENS resolution
      provider.ensAddress = null;

      // Use the first account (deployer) as Central Government
      const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
      const signer = new ethers.Wallet(privateKey, provider);
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      
      // Import contract ABI dynamically
      const contractABI = await import('../../../../artifacts/contracts/SimplifiedSpendingRegistry.sol/SimplifiedSpendingRegistry.json');
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

      // Verify connection by getting contract balance
      const balance = await contract.getContractBalance();
      console.log("Contract balance:", ethers.utils.formatEther(balance), "ETH");

      setContract(contract);
      setConnectionStatus('Connected as Central Government');
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionStatus('Connection failed: ' + error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const registerEntity = async () => {
    if (!contract) {
      setError('Please connect to the contract first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (!ethers.utils.isAddress(entityAddress)) {
        throw new Error('Invalid Ethereum address format');
      }

      const tx = await contract.registerEntity(entityAddress, entityName);
      await tx.wait();
      setEntityDetailsResult(`Entity registered successfully!\nAddress: ${entityAddress}\nName: ${entityName}\nType: ${entityType}\nDescription: ${entityDescription}\nContact: ${entityContact}\nInitial Budget: ${entityBudget} ETH`);
      
      // Clear all fields after successful registration
      setEntityAddress('');
      setEntityName('');
      setEntityType('');
      setEntityDescription('');
      setEntityContact('');
      setEntityBudget('');
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message);
      setEntityDetailsResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deactivateEntity = async () => {
    if (!contract) {
      setError('Please connect to the contract first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (!ethers.utils.isAddress(deactivateAddress)) {
        throw new Error('Invalid Ethereum address format');
      }

      const tx = await contract.deactivateEntity(deactivateAddress);
      await tx.wait();
      setEntityDetailsResult('Entity deactivated successfully!');
      setDeactivateAddress('');
    } catch (error) {
      setError(error.message);
      setEntityDetailsResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const issueFunds = async () => {
    if (!contract) {
      setError('Please connect to the contract first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (!ethers.utils.isAddress(fundAddress)) {
        throw new Error('Invalid Ethereum address format');
      }

      const amount = ethers.utils.parseEther(fundAmount);
      const tx = await contract.issueFunds(fundAddress, { value: amount });
      await tx.wait();
      setEntityDetailsResult('Funds issued successfully!');
      setFundAddress('');
      setFundAmount('');
    } catch (error) {
      setError(error.message);
      setEntityDetailsResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEntityDetails = async () => {
    if (!contract) {
      setError('Please connect to the contract first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (!ethers.utils.isAddress(queryAddress)) {
        throw new Error('Invalid Ethereum address format');
      }

      const [name, isActive, balance] = await contract.getEntityDetails(queryAddress);
      setEntityDetailsResult(`
        Name: ${name}
        Active: ${isActive}
        Balance: ${ethers.utils.formatEther(balance)} ETH
      `);
    } catch (error) {
      setError(error.message);
      setEntityDetailsResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllEntities = async () => {
    if (!contract) {
      setError('Please connect to the contract first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const addresses = await contract.getAllEntityAddresses();
      let result = 'Registered Entities:\n';
      addresses.forEach((address, index) => {
        result += `${index + 1}. ${address}\n`;
      });
      setAllEntitiesResult(result);
    } catch (error) {
      setError(error.message);
      setAllEntitiesResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSpendingRecords = async () => {
    if (!contract) {
      setError('Please connect to the contract first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const records = await contract.getSpendingRecords(
        parseInt(spendingOffset),
        parseInt(spendingLimit)
      );
      let result = '';
      records.forEach((record) => {
        result += `
          ID: ${record.id.toString()}
          Entity: ${record.entity}
          Purpose: ${record.purpose}
          Amount: ${ethers.utils.formatEther(record.amount)} ETH
          Document Hash: ${record.documentHash}
          Timestamp: ${new Date(record.timestamp.toNumber() * 1000).toLocaleString()}
        \n`;
      });
      setSpendingRecordsResult(result);
    } catch (error) {
      setError(error.message);
      setSpendingRecordsResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getContractBalance = async () => {
    if (!contract) {
      setError('Please connect to the contract first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const balance = await contract.getContractBalance();
      setContractBalanceResult(`Contract Balance: ${ethers.utils.formatEther(balance)} ETH`);
    } catch (error) {
      setError(error.message);
      setContractBalanceResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllFundRequests = async () => {
    if (!contract) {
      setError('Please connect to the contract first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const requests = await contract.getFundRequests(
        parseInt(fundRequestOffset),
        parseInt(fundRequestLimit)
      );
      let result = '';
      requests.forEach((request) => {
        result += `
          ID: ${request.id.toString()}
          Entity: ${request.entity}
          Amount: ${ethers.utils.formatEther(request.amount)} ETH
          Reason: ${request.reason}
          Document Hash: ${request.documentHash}
          Timestamp: ${new Date(request.timestamp.toNumber() * 1000).toLocaleString()}
          Status: ${request.isApproved ? 'Approved' : request.isRejected ? 'Rejected' : 'Pending'}
        \n`;
      });
      setAllFundRequestsResult(result);
    } catch (error) {
      setError(error.message);
      setAllFundRequestsResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async () => {
    if (!contract) {
      setError('Please connect to the contract first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (!requestId || isNaN(parseInt(requestId))) {
        throw new Error('Invalid request ID');
      }

      const tx = await contract.approveFundRequest(parseInt(requestId));
      await tx.wait();
      setAllFundRequestsResult('Fund request approved successfully!');
      setRequestId('');
    } catch (error) {
      setError(error.message);
      setAllFundRequestsResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async () => {
    if (!contract) {
      setError('Please connect to the contract first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (!requestId || isNaN(parseInt(requestId))) {
        throw new Error('Invalid request ID');
      }

      const tx = await contract.rejectFundRequest(parseInt(requestId));
      await tx.wait();
      setAllFundRequestsResult('Fund request rejected successfully!');
      setRequestId('');
    } catch (error) {
      setError(error.message);
      setAllFundRequestsResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-10 bg-gray-800/50 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Central Government Dashboard
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                Back to Role Selection
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16 h-[calc(100vh-4rem)]">
        {/* Side Navigation */}
        <div className="w-64 bg-gray-800/30 backdrop-blur-md border-r border-gray-700/50 h-full overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <div
                className={`${
                  connectionStatus.includes("Connected")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {connectionStatus}
              </div>
              <button
                onClick={connectToContract}
                disabled={loading}
                className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                Connect as Central Government
              </button>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection("entity")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeSection === "entity"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                    : "text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                Entity Management
              </button>
              <button
                onClick={() => setActiveSection("monitoring")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeSection === "monitoring"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                    : "text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                Monitoring
              </button>
              <button
                onClick={() => setActiveSection("funds")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeSection === "funds"
                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                    : "text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                Fund Management
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                {error}
              </div>
            )}

            {activeSection === "entity" && (
              <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
                <h2 className="text-lg font-semibold mb-6 text-purple-400">Entity Management</h2>
                
                {/* Register New Entity */}
                <div className="mb-8 space-y-6">
                  <h3 className="text-md font-medium text-gray-300">Register New Entity</h3>
                  
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Entity Address *</label>
                      <input
                        type="text"
                        value={entityAddress}
                        onChange={(e) => setEntityAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Entity Name *</label>
                      <input
                        type="text"
                        value={entityName}
                        onChange={(e) => setEntityName(e.target.value)}
                        placeholder="Enter entity name"
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Entity Type</label>
                      <select
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select entity type</option>
                        <option value="ministry">Ministry</option>
                        <option value="department">Department</option>
                        <option value="agency">Agency</option>
                        <option value="authority">Authority</option>
                        <option value="board">Board</option>
                        <option value="commission">Commission</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Initial Budget (ETH)</label>
                      <input
                        type="number"
                        value={entityBudget}
                        onChange={(e) => setEntityBudget(e.target.value)}
                        placeholder="Enter initial budget"
                        step="0.000000000000000001"
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Contact Information</label>
                    <input
                      type="text"
                      value={entityContact}
                      onChange={(e) => setEntityContact(e.target.value)}
                      placeholder="Enter contact details (email, phone, etc.)"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea
                      value={entityDescription}
                      onChange={(e) => setEntityDescription(e.target.value)}
                      placeholder="Enter entity description, responsibilities, and other relevant details"
                      rows="4"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={registerEntity}
                      disabled={loading}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                    >
                      Register Entity
                    </button>
                  </div>
                </div>

                {/* Deactivate Entity */}
                <div className="border-t border-gray-700/50 pt-6 mt-6">
                  <h3 className="text-md font-medium mb-4 text-gray-300">Deactivate Entity</h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-400 mb-1">Entity Address</label>
                      <input
                        type="text"
                        value={deactivateAddress}
                        onChange={(e) => setDeactivateAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={deactivateEntity}
                        disabled={loading}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                      >
                        Deactivate Entity
                      </button>
                    </div>
                  </div>
                </div>

                {/* Registration Result */}
                {entityDetailsResult && (
                  <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Registration Result</h4>
                    <div className="whitespace-pre-wrap text-gray-300">
                      {entityDetailsResult}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "monitoring" && (
              <div className="space-y-6">
                {/* View All Entities */}
                <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300">
                  <h2 className="text-lg font-semibold mb-4 text-pink-400">Entity Overview</h2>
                  <button
                    onClick={getAllEntities}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    Get All Entities
                  </button>
                  <div className="mt-2 p-4 bg-gray-700/50 rounded-lg whitespace-pre-wrap text-gray-300">
                    {allEntitiesResult}
                  </div>
                </div>

                {/* View Entity Details */}
                <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300">
                  <h2 className="text-lg font-semibold mb-4 text-pink-400">Entity Details</h2>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={queryAddress}
                      onChange={(e) => setQueryAddress(e.target.value)}
                      placeholder="Entity Address"
                      className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={getEntityDetails}
                      disabled={loading}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                      Query
                    </button>
                  </div>
                  <div className="mt-2 p-4 bg-gray-700/50 rounded-lg whitespace-pre-wrap text-gray-300">
                    {entityDetailsResult}
                  </div>
                </div>

                {/* View All Spending Records */}
                <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300">
                  <h2 className="text-lg font-semibold mb-4 text-pink-400">Spending Records</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={spendingOffset}
                      onChange={(e) => setSpendingOffset(e.target.value)}
                      placeholder="Offset"
                      className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={spendingLimit}
                      onChange={(e) => setSpendingLimit(e.target.value)}
                      placeholder="Limit"
                      className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={getSpendingRecords}
                    disabled={loading}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    Query
                  </button>
                  <div className="mt-2 p-4 bg-gray-700/50 rounded-lg whitespace-pre-wrap text-gray-300">
                    {spendingRecordsResult}
                  </div>
                </div>

                {/* Contract Balance */}
                <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300">
                  <h2 className="text-lg font-semibold mb-4 text-pink-400">Contract Balance</h2>
                  <button
                    onClick={getContractBalance}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    Get Contract Balance
                  </button>
                  <div className="mt-2 p-4 bg-gray-700/50 rounded-lg text-gray-300">
                    {contractBalanceResult}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "funds" && (
              <div className="space-y-6">
                {/* Issue Funds */}
                <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300">
                  <h2 className="text-lg font-semibold mb-4 text-green-400">Issue Funds</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={fundAddress}
                      onChange={(e) => setFundAddress(e.target.value)}
                      placeholder="Entity Address"
                      className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      placeholder="Amount (ETH)"
                      className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={issueFunds}
                    disabled={loading}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    Issue Funds
                  </button>
                </div>

                {/* Fund Request Management */}
                <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300">
                  <h2 className="text-lg font-semibold mb-4 text-green-400">Fund Request Management</h2>
                  
                  {/* View All Fund Requests */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium mb-2 text-gray-300">View All Fund Requests</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={fundRequestOffset}
                        onChange={(e) => setFundRequestOffset(e.target.value)}
                        placeholder="Offset"
                        className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={fundRequestLimit}
                        onChange={(e) => setFundRequestLimit(e.target.value)}
                        placeholder="Limit"
                        className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={getAllFundRequests}
                      disabled={loading}
                      className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                      Query
                    </button>
                    <div className="mt-2 p-4 bg-gray-700/50 rounded-lg whitespace-pre-wrap text-gray-300">
                      {allFundRequestsResult}
                    </div>
                  </div>

                  {/* Process Fund Request */}
                  <div>
                    <h3 className="text-md font-medium mb-2 text-gray-300">Process Fund Request</h3>
                    <div className="flex gap-4">
                      <input
                        type="number"
                        value={requestId}
                        onChange={(e) => setRequestId(e.target.value)}
                        placeholder="Request ID"
                        className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={approveRequest}
                        disabled={loading}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                      >
                        Approve Request
                      </button>
                      <button
                        onClick={rejectRequest}
                        disabled={loading}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                      >
                        Reject Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
              activeSection === 'entity' ? 'border-blue-500' :
              activeSection === 'monitoring' ? 'border-purple-500' :
              activeSection === 'funds' ? 'border-green-500' : 'border-blue-500'
            }`}></div>
            <p className="mt-4 text-center text-gray-300">Processing transaction...</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
