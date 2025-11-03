import React, { useState } from "react";
import { uploadReceipt } from "../api";

function ReceiptUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const data = await uploadReceipt(formData);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Upload Receipt</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {result && (
        <div className="mt-4">
          <h3 className="font-semibold">OCR Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ReceiptUpload;
