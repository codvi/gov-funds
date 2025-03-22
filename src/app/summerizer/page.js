"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Doughnut, Radar, HorizontalBar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, PointElement, LineElement } from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement
);

export default function Home() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/reports/get_docs");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleDocumentSelect = async (documentId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/reports/get_docs/${documentId}`);
      setResults([response.data]);
      setSelectedDocument(documentId);
      setShowUploader(false);
    } catch (error) {
      setError("Error fetching document analysis");
    }
  };

  const handleBack = () => {
    setSelectedDocument(null);
    setResults([]);
    setShowUploader(false);
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    setFiles(selectedFiles);
    
    // Create preview URLs for selected files
    const urls = Array.from(selectedFiles).map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Cleanup preview URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("pdf_file", files[i]);
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/reports/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResults(response.data.results);
      setSelectedDocument(response.data.results[0]._id);
      setShowUploader(false);
      fetchDocuments(); // Refresh the document list
    } catch (error) {
      setError("An error occurred during the file upload.");
    } finally {
      setLoading(false);
    }
  };

  const getFinancialData = (data) => {
    const labels = data.map((item) => item.fileName);
    const totalBudget = data.map((item) => item.analysis.financialDetails.totalBudget);
    const fundsSpent = data.map((item) => item.analysis.financialDetails.fundsSpent);
    const remainingFunds = data.map((item) => item.analysis.financialDetails.remainingFunds);

    return { labels, totalBudget, fundsSpent, remainingFunds };
  };

  const chartData = results.length > 0 && getFinancialData(results);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 p-4">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Documents</h2>
              <button
                onClick={() => setShowUploader(true)}
                className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {documents.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => handleDocumentSelect(doc._id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedDocument === doc._id
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="truncate">{doc.fileName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">PDF Analysis Dashboard</h1>
              <p className="text-gray-300">View and analyze your PDF reports</p>
            </div>

            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-8">
                {error}
              </div>
            )}

            {showUploader ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Upload PDF</h2>
                  <button
                    onClick={() => setShowUploader(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Cancel</span>
                  </button>
                </div>
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="flex flex-col items-center justify-center w-full">
                    <label className="w-full flex flex-col items-center px-8 py-6 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600 cursor-pointer hover:bg-gray-700/70 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">PDF files only</p>
                      </div>
                      <input type="file" className="hidden" multiple accept="application/pdf" onChange={handleFileChange} required />
                    </label>
                  </div>

                  {/* PDF Preview Section */}
                  {previewUrls.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-gray-300 truncate">{files[index].name}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = Array.from(files).filter((_, i) => i !== index);
                                  const newUrls = previewUrls.filter((_, i) => i !== index);
                                  setFiles(newFiles);
                                  setPreviewUrls(newUrls);
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
                              <iframe
                                src={url}
                                className="w-full h-full"
                                title={`PDF Preview ${index + 1}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Upload and Analyze</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedDocument ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Document Analysis</h2>
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Documents</span>
                  </button>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
                  <div className="grid grid-cols-1 gap-8">
                    {results.map((result) => (
                      <div key={result._id} className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-purple-500/50 transition-colors">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-4">{result.fileName}</h3>
                            <div className="space-y-3">
                              {/* <p className="text-gray-300"><span className="text-purple-400">Project:</span> {result.analysis.project}</p> */}
                              <p className="text-gray-300"><span className="text-purple-400">Summary:</span> {result.analysis.summary}</p>
                              <p className="text-gray-300"><span className="text-purple-400">Funds Spent:</span> <span className="text-red-400">${result.analysis.financialDetails.fundsSpent}</span></p>
                              <p className="text-gray-300"><span className="text-purple-400">Remaining Funds:</span> <span className="text-green-400">${result.analysis.financialDetails.remainingFunds}</span></p>
                              <p className="text-gray-300"><span className="text-purple-400">Total Budget:</span> <span className="text-blue-400">${result.analysis.financialDetails.totalBudget}</span></p>
                            </div>
                          </div>
                          <div className="h-[300px]">
                            <Doughnut
                              data={{
                                labels: ["Spent", "Remaining"],
                                datasets: [{
                                  data: [
                                    result.analysis.financialDetails.fundsSpent,
                                    result.analysis.financialDetails.remainingFunds
                                  ],
                                  backgroundColor: [
                                    "rgba(239, 68, 68, 0.8)",
                                    "rgba(34, 197, 94, 0.8)"
                                  ],
                                  borderColor: [
                                    "rgba(239, 68, 68, 1)",
                                    "rgba(34, 197, 94, 1)"
                                  ],
                                  borderWidth: 1,
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'bottom',
                                    labels: {
                                      color: "white",
                                      padding: 10,
                                    },
                                  },
                                  tooltip: {
                                    backgroundColor: "rgba(17, 24, 39, 0.8)",
                                    titleColor: "white",
                                    bodyColor: "white",
                                    callbacks: {
                                      label: (tooltipItem) => {
                                        return `$${tooltipItem.raw.toLocaleString()}`;
                                      },
                                    },
                                  },
                                },
                                cutout: '70%',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-6">Financial Overview</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h3 className="text-xl font-semibold text-white mb-4">Project Financial Comparison</h3>
                      <div className="h-[400px]">
                        <Bar
                          data={{
                            labels: chartData?.labels,
                            datasets: [
                              {
                                label: "Total Budget",
                                data: chartData?.totalBudget,
                                backgroundColor: "rgba(59, 130, 246, 0.8)",
                                borderColor: "rgba(59, 130, 246, 1)",
                                borderWidth: 1,
                                borderRadius: 8,
                              },
                              {
                                label: "Funds Spent",
                                data: chartData?.fundsSpent,
                                backgroundColor: "rgba(239, 68, 68, 0.8)",
                                borderColor: "rgba(239, 68, 68, 1)",
                                borderWidth: 1,
                                borderRadius: 8,
                              },
                              {
                                label: "Remaining Funds",
                                data: chartData?.remainingFunds,
                                backgroundColor: "rgba(34, 197, 94, 0.8)",
                                borderColor: "rgba(34, 197, 94, 1)",
                                borderWidth: 1,
                                borderRadius: 8,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  color: "white",
                                  padding: 20,
                                  usePointStyle: true,
                                  pointStyle: 'circle',
                                  font: {
                                    size: 12,
                                  },
                                },
                              },
                              tooltip: {
                                backgroundColor: "rgba(17, 24, 39, 0.8)",
                                titleColor: "white",
                                bodyColor: "white",
                                padding: 12,
                                cornerRadius: 8,
                                callbacks: {
                                  label: (tooltipItem) => {
                                    return `$${tooltipItem.raw.toLocaleString()}`;
                                  },
                                },
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                grid: {
                                  color: "rgba(255, 255, 255, 0.1)",
                                  drawBorder: false,
                                },
                                ticks: {
                                  color: "white",
                                  padding: 10,
                                  callback: (value) => `$${value.toLocaleString()}`,
                                },
                              },
                            //   x: {
                            //     grid: {
                            //       display: false,
                            //     },
                            //     ticks: {
                            //       color: "white",
                            //       padding: 10,
                            //       maxRotation: 45,
                            //       minRotation: 45,
                            //     },
                            //   },
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h3 className="text-xl font-semibold text-white mb-4">Total Allocation Overview</h3>
                      <div className="h-[400px]">
                        <Radar
                          data={{
                            labels: ["Budget Utilization", "Fund Efficiency", "Project Scale", "Resource Allocation", "Financial Health"],
                            datasets: [
                              {
                                label: "Overall Performance",
                                data: [
                                  (results.reduce((sum, item) => sum + item.analysis.financialDetails.fundsSpent, 0) / 
                                   results.reduce((sum, item) => sum + item.analysis.financialDetails.totalBudget, 0)) * 100,
                                  80,
                                  75,
                                  85,
                                  90
                                ],
                                backgroundColor: "rgba(147, 51, 234, 0.2)",
                                borderColor: "rgba(147, 51, 234, 1)",
                                borderWidth: 2,
                                pointBackgroundColor: "rgba(147, 51, 234, 1)",
                                pointBorderColor: "#fff",
                                pointHoverBackgroundColor: "#fff",
                                pointHoverBorderColor: "rgba(147, 51, 234, 1)",
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  color: "white",
                                  padding: 20,
                                },
                              },
                              tooltip: {
                                backgroundColor: "rgba(17, 24, 39, 0.8)",
                                titleColor: "white",
                                bodyColor: "white",
                                callbacks: {
                                  label: (tooltipItem) => {
                                    return `${tooltipItem.raw}%`;
                                  },
                                },
                              },
                            },
                            scales: {
                              r: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                  color: "white",
                                  backdropColor: "transparent",
                                },
                                grid: {
                                  color: "rgba(255, 255, 255, 0.1)",
                                },
                                angleLines: {
                                  color: "rgba(255, 255, 255, 0.1)",
                                },
                                pointLabels: {
                                  color: "white",
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700 shadow-lg">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Select a Document</h2>
                  <p className="text-gray-300 mb-8">Choose a document from the sidebar to view its analysis</p>
                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl bg-gray-700/50 rounded-lg p-6 border border-gray-600">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-300">Select a document from the sidebar to view its analysis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}