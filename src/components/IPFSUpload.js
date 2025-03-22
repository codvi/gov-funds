import React, { useState } from "react";
import axios from "axios";

export default function IPFSUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pre-filled Pinata credentials
  const PINATA_API_KEY = "44fa63f8bf1b21dded43";
  const PINATA_SECRET_KEY =
    "d6228813e4d0ce8be5f0419150a6c050241e444f2afd378614bb72ffdd18fdf2";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const uploadToIPFS = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const uri = `ipfs://${ipfsHash}/${file.name}`;
      setResult({ uri, hash: ipfsHash });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-xl font-semibold text-white mb-6">
        Upload Document to IPFS
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="fileInput"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Select Document
          </label>
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
            className="w-full p-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 transition-all duration-200"
          />
        </div>

        <button
          onClick={uploadToIPFS}
          disabled={isLoading}
          className="w-full bg-blue-500/80 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading...</span>
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>Upload to IPFS</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-green-400 mb-2">
              Upload Successful!
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">IPFS Hash:</span>
                <span className="text-sm text-white font-mono">
                  {result.hash}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">IPFS URI:</span>
                <span className="text-sm text-white font-mono break-all">
                  {result.uri}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
