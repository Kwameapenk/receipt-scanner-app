import React, { useState } from 'react';

export default function ReceiptScanner() {
  const [file, setFile] = useState(null);
  const [receiptName, setReceiptName] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a receipt image');
      return;
    }

    if (!receiptName.trim()) {
      setError('Please enter a receipt name');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const response = await fetch('http://localhost:5050/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      setReceipt({
        ...data,
        receipt_name: receiptName
      });
    } catch (err) {
      setError('Error processing receipt: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setReceiptName('');
    setReceipt(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-xl mx-auto">
        {!receipt ? (
          // Input Section
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">📸 Receipt Scanner</h1>
            <p className="text-center text-gray-600 mb-8">Scan and organize your receipts</p>

            <div className="space-y-6">
              {/* Receipt Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Receipt Name</label>
                <input
                  type="text"
                  value={receiptName}
                  onChange={(e) => setReceiptName(e.target.value)}
                  placeholder="e.g., Grocery Shopping, Gas Station"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>

              {/* File Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Receipt Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <div className="text-4xl mb-2">📷</div>
                    {file ? (
                      <div>
                        <p className="text-green-600 font-semibold">{file.name}</p>
                        <p className="text-sm text-gray-600">Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-700 font-semibold">Click to upload</p>
                        <p className="text-sm text-gray-600">PNG, JPG, HEIC or WEBP</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={handleProcess}
                disabled={loading || !file || !receiptName.trim()}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition ${
                  loading || !file || !receiptName.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  '✓ Process Receipt'
                )}
              </button>
            </div>
          </div>
        ) : (
          // Results Section
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h2 className="text-3xl font-bold">{receipt.receipt_name}</h2>
                <p className="text-blue-100 mt-1">Results</p>
              </div>

              {/* Results Content */}
              <div className="p-8 space-y-8">
                {/* Store Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Store Information</h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Store Name</p>
                      <p className="text-lg font-semibold text-gray-900">{receipt.receipt.store_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-gray-800">{receipt.receipt.store_address || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-gray-800">{receipt.receipt.store_phone || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Transaction Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">{receipt.receipt.transaction_date || '—'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-semibold text-gray-900">{receipt.receipt.transaction_time || '—'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Payment</p>
                      <p className="font-semibold text-gray-900">{receipt.receipt.payment_method || '—'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Reference #</p>
                      <p className="font-semibold text-gray-900">{receipt.receipt.reference_number || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Amount Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Amount Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-semibold">${receipt.receipt.subtotal || '0.00'}</span>
                    </div>
                    {receipt.receipt.tax && (
                      <div className="flex justify-between text-gray-700">
                        <span>Tax:</span>
                        <span className="font-semibold">${receipt.receipt.tax}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-blue-600 pt-3 border-t-2 border-gray-300">
                      <span>Total:</span>
                      <span>${receipt.receipt.total || '0.00'}</span>
                    </div>
                  </div>
                </div>

                {/* Items Detected */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Items Detected ({receipt.detections_found})</h3>
                  <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                    {receipt.detections_found} text elements detected in the receipt image.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleReset}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition"
            >
              ← Scan Another Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}