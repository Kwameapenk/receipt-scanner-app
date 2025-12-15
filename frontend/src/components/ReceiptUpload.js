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
        receipt_name: receiptName || 'Receipt'
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #eff6ff, #f3e8ff)',
      padding: '16px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {!receipt ? (
          // Input Section
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            padding: '32px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '8px',
              color: '#1f2937'
            }}>📸 Receipt Scanner</h1>
            <p style={{
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: '32px'
            }}>Scan and organize your receipts</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Receipt Name Input */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Receipt Name (Optional)</label>
                <input
                  type="text"
                  value={receiptName}
                  onChange={(e) => setReceiptName(e.target.value)}
                  placeholder="e.g., Grocery Shopping"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              {/* File Selection */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Choose Receipt Image</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    style={{
                      display: 'block',
                      padding: '24px',
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: file ? '#dcfce7' : '#f9fafb'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.background = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.background = file ? '#dcfce7' : '#f9fafb';
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                    {file ? (
                      <div>
                        <p style={{ color: '#16a34a', fontWeight: '600' }}>{file.name}</p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <p style={{ color: '#374151', fontWeight: '600' }}>Click to upload</p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>PNG, JPG, HEIC or WEBP</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  padding: '16px',
                  background: '#fee2e2',
                  borderLeft: '4px solid #ef4444',
                  color: '#b91c1c',
                  borderRadius: '4px'
                }}>
                  {error}
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={handleProcess}
                disabled={loading || !file}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  color: 'white',
                  border: 'none',
                  cursor: file && !loading ? 'pointer' : 'not-allowed',
                  background: file && !loading ? '#2563eb' : '#9ca3af',
                  transition: 'all 0.2s',
                  fontSize: '16px'
                }}
                onMouseEnter={(e) => {
                  if (file && !loading) {
                    e.target.style.background = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (file && !loading) {
                    e.target.style.background = '#2563eb';
                  }
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }}></div>
                    Processing...
                  </div>
                ) : (
                  '✓ Process Receipt'
                )}
              </button>

              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        ) : (
          // Results Section
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Card */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                padding: '24px',
                color: 'white'
              }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0'
                }}>{receipt.receipt_name}</h2>
                <p style={{
                  margin: 0,
                  opacity: 0.9
                }}>Results</p>
              </div>

              {/* Results Content */}
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Store Info */}
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '16px'
                  }}>Store Information</h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: '#f3f4f6',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Store Name</p>
                      <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '4px 0 0 0' }}>
                        {receipt.receipt.store_name || '—'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Address</p>
                      <p style={{ color: '#1f2937', margin: '4px 0 0 0' }}>
                        {receipt.receipt.store_address || '—'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Phone</p>
                      <p style={{ color: '#1f2937', margin: '4px 0 0 0' }}>
                        {receipt.receipt.store_phone || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction Info */}
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '16px'
                  }}>Transaction Details</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '16px',
                      borderRadius: '8px'
                    }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Date</p>
                      <p style={{ fontWeight: '600', color: '#1f2937', margin: '8px 0 0 0' }}>
                        {receipt.receipt.transaction_date || '—'}
                      </p>
                    </div>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '16px',
                      borderRadius: '8px'
                    }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Time</p>
                      <p style={{ fontWeight: '600', color: '#1f2937', margin: '8px 0 0 0' }}>
                        {receipt.receipt.transaction_time || '—'}
                      </p>
                    </div>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '16px',
                      borderRadius: '8px'
                    }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Payment</p>
                      <p style={{ fontWeight: '600', color: '#1f2937', margin: '8px 0 0 0' }}>
                        {receipt.receipt.payment_method || '—'}
                      </p>
                    </div>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '16px',
                      borderRadius: '8px'
                    }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Reference #</p>
                      <p style={{ fontWeight: '600', color: '#1f2937', margin: '8px 0 0 0' }}>
                        {receipt.receipt.reference_number || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount Summary */}
                <div style={{
                  background: 'linear-gradient(to bottom right, #eff6ff, #f3e8ff)',
                  padding: '24px',
                  borderRadius: '8px',
                  border: '2px solid #dbeafe'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '16px',
                    margin: 0
                  }}>Amount Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                      <span>Subtotal:</span>
                      <span style={{ fontWeight: '600' }}>${receipt.receipt.subtotal || '0.00'}</span>
                    </div>
                    {receipt.receipt.tax && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                        <span>Tax:</span>
                        <span style={{ fontWeight: '600' }}>${receipt.receipt.tax}</span>
                      </div>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#2563eb',
                      paddingTop: '12px',
                      borderTop: '2px solid #d1d5db'
                    }}>
                      <span>Total:</span>
                      <span>${receipt.receipt.total || '0.00'}</span>
                    </div>
                  </div>
                </div>

                {/* Items Detected */}
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '16px'
                  }}>Items Detected ({receipt.detections_found})</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    background: '#eff6ff',
                    padding: '16px',
                    borderRadius: '8px',
                    margin: 0
                  }}>
                    {receipt.detections_found} text elements detected in the receipt image.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleReset}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                color: 'white',
                border: 'none',
                background: '#2563eb',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.background = '#2563eb'}
            >
              ← Scan Another Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}