import React, { useState } from 'react';
import { Upload, Check, Edit2, X, Save, Camera } from 'lucide-react';

export default function ReceiptScanner() {
  const [file, setFile] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    store_address: '',
    store_phone: '',
    transaction_date: '',
    transaction_time: '',
    subtotal: '',
    tax: '',
    total: '',
    payment_method: '',
    reference_number: ''
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('receipt', file);

    try {
      const response = await fetch('http://localhost:5050/upload', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      
      setReceipt(data);
      setFormData({
        store_name: data.receipt.store_name || '',
        store_address: data.receipt.store_address || '',
        store_phone: data.receipt.store_phone || '',
        transaction_date: data.receipt.transaction_date || '',
        transaction_time: data.receipt.transaction_time || '',
        subtotal: data.receipt.subtotal || '',
        tax: data.receipt.tax || '',
        total: data.receipt.total || '',
        payment_method: data.receipt.payment_method || '',
        reference_number: data.receipt.reference_number || ''
      });
      setIsEditing(true);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saved receipt:', formData);
    alert('Receipt saved successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setReceipt(null);
    setFile(null);
    setFormData({
      store_name: '',
      store_address: '',
      store_phone: '',
      transaction_date: '',
      transaction_time: '',
      subtotal: '',
      tax: '',
      total: '',
      payment_method: '',
      reference_number: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Receipt Scanner</h1>
          </div>
          <p className="text-gray-600">Scan your receipts and organize your expenses</p>
        </div>

        {!isEditing ? (
          // Upload Section
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="space-y-6">
              {/* File Input */}
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
                  className={`block p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${
                    file
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  {file ? (
                    <div>
                      <p className="text-green-600 font-semibold">{file.name}</p>
                      <p className="text-sm text-gray-600">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 font-semibold mb-1">Choose a receipt image</p>
                      <p className="text-sm text-gray-600">PNG, JPG, HEIC or WEBP</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || !file}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                  loading || !file
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Scanning Receipt...
                  </div>
                ) : (
                  'Scan Receipt'
                )}
              </button>
            </div>
          </div>
        ) : (
          // Receipt Details Section
          <div className="space-y-6">
            {/* Receipt Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{formData.store_name || 'Receipt'}</h2>
                <p className="text-blue-100">Transaction Details</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Store Section */}
                <div className="border-b pb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Store Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Store Name (Editable)</label>
                      <input
                        type="text"
                        name="store_name"
                        value={formData.store_name}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                      <p className="text-gray-700 py-2">{formData.store_address || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                      <p className="text-gray-700 py-2">{formData.store_phone || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Section */}
                <div className="border-b pb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Transaction Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                      <p className="text-gray-700 py-2">{formData.transaction_date || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Time</label>
                      <p className="text-gray-700 py-2">{formData.transaction_time || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Method</label>
                      <p className="text-gray-700 py-2">{formData.payment_method || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Reference #</label>
                      <p className="text-gray-700 py-2">{formData.reference_number || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Amount Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="text-lg font-semibold text-gray-900">${formData.subtotal || '0.00'}</span>
                    </div>
                    {formData.tax && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Tax</span>
                        <span className="text-lg font-semibold text-gray-900">${formData.tax}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">Total</span>
                      <span className="text-2xl font-bold text-blue-600">${formData.total || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 px-4 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}