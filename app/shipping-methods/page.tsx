'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  description?: string;
  price: string;
  estimatedDays?: number;
  isActive: boolean;
  sortOrder: number;
  carrierId?: string;
  serviceTypeId?: string;
  // Keep legacy fields for backward compatibility
  carrierCode?: string;
  serviceCode?: string;
  createdAt: string;
  updatedAt: string;
  // New related data
  carrier?: {
    id: string;
    name: string;
    code: string;
    trackingUrl?: string;
  };
  serviceType?: {
    id: string;
    name: string;
    code: string;
    category?: string;
  };
}

export default function ShippingMethodsList() {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShippingMethods = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shipping-methods');
      const data = await res.json();
      setShippingMethods(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingMethods();
  }, []);



  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this shipping method? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/shipping-methods/${id}`, { 
          method: 'DELETE' 
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete shipping method');
        }
        
        fetchShippingMethods();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };



  const formatPrice = (price: string | number) => {
    if (!price) return 'N/A';
    return `Rs${parseFloat(price.toString()).toFixed(2)}`;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">🚚 Shipping Methods</h1>
          <div className="flex gap-4 mt-2">
            <Link 
              href="/shipping-carriers"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              📦 Manage Carriers
            </Link>
            <Link 
              href="/shipping-service-types"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              🏷️ Manage Service Types
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchShippingMethods}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <Link 
            href="/shipping-methods/add"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ➕ Add New Method
          </Link>
        </div>
      </div>


      {/* Methods Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Code</th>
              <th className="border p-2 text-left">Price</th>
              <th className="border p-2 text-left">Estimated Days</th>
              <th className="border p-2 text-left">Carrier</th>
              <th className="border p-2 text-left">Service Type</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Sort Order</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shippingMethods.length > 0 ? (
              shippingMethods.map((method) => (
                <tr key={method.id}>
                  <td className="border p-2">
                    <div className="font-medium">{method.name}</div>
                    {method.description && (
                      <div className="text-sm text-gray-600">
                        {method.description.length > 50 
                          ? method.description.substring(0, 50) + '...' 
                          : method.description
                        }
                      </div>
                    )}
                  </td>
                  <td className="border p-2">{method.code}</td>
                  <td className="border p-2">{formatPrice(method.price)}</td>
                  <td className="border p-2">{method.estimatedDays || 'N/A'}</td>
                  <td className="border p-2">
                    {method.carrier ? (
                      <div>
                        <div className="font-medium text-sm">{method.carrier.name}</div>
                        <div className="text-xs text-gray-500">{method.carrier.code}</div>
                      </div>
                    ) : method.carrierCode ? (
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">
                        {method.carrierCode}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="border p-2">
                    {method.serviceType ? (
                      <div>
                        <div className="font-medium text-sm">{method.serviceType.name}</div>
                        <div className="text-xs text-gray-500">
                          {method.serviceType.code}
                          {method.serviceType.category && ` • ${method.serviceType.category}`}
                        </div>
                      </div>
                    ) : method.serviceCode ? (
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded capitalize">
                        {method.serviceCode}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      method.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {method.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="border p-2">{method.sortOrder}</td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <Link 
                        href={`/shipping-methods/edit/${method.id}`}
                        className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(method.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="border p-2 text-center">
                  No shipping methods found. Create your first method to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 