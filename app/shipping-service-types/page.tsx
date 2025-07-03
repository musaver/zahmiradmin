'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ShippingServiceType {
  id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function ShippingServiceTypesList() {
  const [serviceTypes, setServiceTypes] = useState<ShippingServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shipping-service-types');
      if (!response.ok) throw new Error('Failed to fetch service types');
      const data = await response.json();
      setServiceTypes(data);
    } catch (error) {
      console.error('Error fetching service types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service type? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/shipping-service-types/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setServiceTypes(serviceTypes.filter(serviceType => serviceType.id !== id));
        } else {
          throw new Error('Failed to delete service type');
        }
      } catch (error) {
        console.error('Error deleting service type:', error);
        alert('Failed to delete service type');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    
    const categoryColors: Record<string, string> = {
      ground: 'bg-brown-100 text-brown-800',
      air: 'bg-blue-100 text-blue-800',
      express: 'bg-red-100 text-red-800',
      standard: 'bg-gray-100 text-gray-800',
      overnight: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        categoryColors[category.toLowerCase()] || 'bg-gray-100 text-gray-800'
      }`}>
        {category}
      </span>
    );
  };

  if (loading) return <div className="p-8 text-center">Loading service types...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📦 Shipping Service Types</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchServiceTypes}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <Link 
            href="/shipping-service-types/add"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ➕ Add New Service Type
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">{serviceTypes.length}</div>
          <div className="text-blue-600">Total Service Types</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-800">
            {serviceTypes.filter(st => st.isActive).length}
          </div>
          <div className="text-green-600">Active Types</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-800">
            {serviceTypes.filter(st => st.category === 'express').length}
          </div>
          <div className="text-purple-600">Express Services</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-800">
            {serviceTypes.filter(st => st.category === 'ground').length}
          </div>
          <div className="text-orange-600">Ground Services</div>
        </div>
      </div>

      {/* Service Types Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b p-3 text-left font-semibold">Name</th>
                <th className="border-b p-3 text-left font-semibold">Code</th>
                <th className="border-b p-3 text-left font-semibold">Category</th>
                <th className="border-b p-3 text-left font-semibold">Description</th>
                <th className="border-b p-3 text-left font-semibold">Status</th>
                <th className="border-b p-3 text-left font-semibold">Sort Order</th>
                <th className="border-b p-3 text-left font-semibold">Created</th>
                <th className="border-b p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceTypes.length > 0 ? (
                serviceTypes.map((serviceType) => (
                  <tr key={serviceType.id} className="hover:bg-gray-50">
                    <td className="border-b p-3">
                      <div className="font-medium">{serviceType.name}</div>
                    </td>
                    <td className="border-b p-3">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {serviceType.code}
                      </code>
                    </td>
                    <td className="border-b p-3">
                      {getCategoryBadge(serviceType.category)}
                    </td>
                    <td className="border-b p-3">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {serviceType.description || 'No description'}
                      </div>
                    </td>
                    <td className="border-b p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        serviceType.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {serviceType.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="border-b p-3 text-center">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {serviceType.sortOrder}
                      </span>
                    </td>
                    <td className="border-b p-3 text-sm text-gray-600">
                      {formatDate(serviceType.createdAt)}
                    </td>
                    <td className="border-b p-3">
                      <div className="flex gap-1">
                        <Link 
                          href={`/shipping-service-types/edit/${serviceType.id}`}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(serviceType.id)}
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
                    No service types found. <Link href="/shipping-service-types/add" className="text-blue-600 hover:text-blue-800">Add your first service type</Link>
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