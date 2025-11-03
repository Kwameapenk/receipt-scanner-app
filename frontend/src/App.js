import React from 'react';
import ReceiptUpload from "./components/ReceiptUpload";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900 p-4">
      <h1 className="text-3xl font-bold mb-6">Receipt OCR App</h1>
      <ReceiptUpload />
    </div>
  );
}

export default App;
