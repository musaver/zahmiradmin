'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ShippingCarrier {
  id: string;
  name: string;
  code: string;
  description?: string;
  website?: string;
  trackingUrl?: string;
  apiEndpoint?: string;
  apiKey?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function ShippingCarriersList() {
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarriers();
  }, []);

  const fetchCarriers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shipping-carriers');
      if (!response.ok) throw new Error('Failed to fetch carriers');
      const data = await response.json();
      setCarriers(data);
    } catch (error) {
      console.error('Error fetching carriers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this carrier? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/shipping-carriers/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setCarriers(carriers.filter(carrier => carrier.id !== id));
        } else {
          throw new Error('Failed to delete carrier');
        }
      } catch (error) {
        console.error('Error deleting carrier:', error);
        alert('Failed to delete carrier');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="p-8 text-center">Loading carriers...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🚚 Shipping Carriers</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchCarriers}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <Link 
            href="/shipping-carriers/add"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ➕ Add New Carrier
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">{carriers.length}</div>
          <div className="text-blue-600">Total Carriers</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-800">
            {carriers.filter(c => c.isActive).length}
          </div>
          <div className="text-green-600">Active Carriers</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-800">
            {carriers.filter(c => c.apiEndpoint).length}
          </div>
          <div className="text-orange-600">API Integrated</div>
        </div>
      </div>

      {/* Carriers Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b p-3 text-left font-semibold">Name</th>
                <th className="border-b p-3 text-left font-semibold">Code</th>
                <th className="border-b p-3 text-left font-semibold">Website</th>
                <th className="border-b p-3 text-left font-semibold">API</th>
                <th className="border-b p-3 text-left font-semibold">Status</th>
                <th className="border-b p-3 text-left font-semibold">Sort Order</th>
                <th className="border-b p-3 text-left font-semibold">Created</th>
                <th className="border-b p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carriers.length > 0 ? (
                carriers.map((carrier) => (
                  <tr key={carrier.id} className="hover:bg-gray-50">
                    <td className="border-b p-3">
                      <div>
                        <div className="font-medium">{carrier.name}</div>
                        {carrier.description && (
                          <div className="text-sm text-gray-600">{carrier.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="border-b p-3">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {carrier.code}
                      </code>
                    </td>
                    <td className="border-b p-3">
                      {carrier.website ? (
                        <a 
                          href={carrier.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          🔗 Visit
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="border-b p-3">
                      <div className="flex items-center gap-2">
                        {carrier.apiEndpoint ? (
                          <span className="text-green-600 text-sm">✅ Configured</span>
                        ) : (
                          <span className="text-gray-400 text-sm">❌ Not configured</span>
                        )}
                      </div>
                    </td>
                    <td className="border-b p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        carrier.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {carrier.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="border-b p-3 text-center">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {carrier.sortOrder}
                      </span>
                    </td>
                    <td className="border-b p-3 text-sm text-gray-600">
                      {formatDate(carrier.createdAt)}
                    </td>
                    <td className="border-b p-3">
                      <div className="flex gap-1">
                        <Link 
                          href={`/shipping-carriers/edit/${carrier.id}`}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(carrier.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="border-b p-8 text-center text-gray-500">
                    No carriers found. <Link href="/shipping-carriers/add" className="text-blue-600 hover:text-blue-800">Add your first carrier</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 