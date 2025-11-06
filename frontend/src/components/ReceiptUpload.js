import React, { useState, useEffect } from "react";
import { uploadReceipt } from "../api";

function ReceiptUpload() {
  const [file, setFile] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    store_name: "",
    store_address: "",
    store_phone: "",
    transaction_date: "",
    transaction_time: "",
    subtotal: "",
    tax: "",
    total: "",
    payment_method: "",
    reference_number: "",
    items: []
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append("receipt", file);

    try {
      const data = await uploadReceipt(formDataToSend);
      setReceipt(data);
      
      // Populate form with scanned data
      setFormData({
        store_name: data.receipt.store_name || "",
        store_address: data.receipt.store_address || "",
        store_phone: data.receipt.store_phone || "",
        transaction_date: data.receipt.transaction_date || "",
        transaction_time: data.receipt.transaction_time || "",
        subtotal: data.receipt.subtotal || "",
        tax: data.receipt.tax || "",
        total: data.receipt.total || "",
        payment_method: data.receipt.payment_method || "",
        reference_number: data.receipt.reference_number || "",
        items: data.receipt.items || []
      });
      
      setEditMode(true);
    } catch (error) {
      console.error(error);
      alert("Error uploading receipt: " + error.message);
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

  const handleItemChange = (index, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = value;
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, ""]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    console.log("Saved receipt data:", formData);
    alert("Receipt data saved successfully!");
    // Here you would typically send this to your backend
  };

  const handleCancel = () => {
    setEditMode(false);
    setReceipt(null);
    setFormData({
      store_name: "",
      store_address: "",
      store_phone: "",
      transaction_date: "",
      transaction_time: "",
      subtotal: "",
      tax: "",
      total: "",
      payment_method: "",
      reference_number: "",
      items: []
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Receipt Scanner</h2>

      {!editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
            >
              {loading ? "Scanning..." : "Scan Receipt"}
            </button>
          </div>
        </form>
      ) : (
        <form className="space-y-6">
          {/* Receipt Summary Section */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                name="store_name"
                value={formData.store_name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <p className="text-gray-600">{formData.store_address}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-gray-600">{formData.store_phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <p className="text-gray-600">{formData.transaction_date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <p className="text-gray-600">{formData.transaction_time}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <p className="text-lg font-semibold text-gray-800">${formData.subtotal}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
                <p className="text-lg font-semibold text-gray-800">${formData.tax || "0.00"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <p className="text-lg font-semibold text-blue-600">${formData.total}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <p className="text-gray-600">{formData.payment_method}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <p className="text-gray-600">{formData.reference_number}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Save Receipt
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ReceiptUpload;