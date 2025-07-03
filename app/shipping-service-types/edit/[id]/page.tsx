'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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

export default function EditShippingServiceType() {
  const router = useRouter();
  const params = useParams();
  const serviceTypeId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serviceType, setServiceType] = useState<ShippingServiceType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    isActive: true,
    sortOrder: 0,
  });

  const categoryOptions = [
    { value: '', label: 'Select Category (Optional)' },
    { value: 'ground', label: 'Ground' },
    { value: 'air', label: 'Air' },
    { value: 'express', label: 'Express' },
    { value: 'standard', label: 'Standard' },
    { value: 'overnight', label: 'Overnight' },
    { value: 'expedited', label: 'Expedited' },
    { value: '2day', label: '2-Day' },
    { value: 'international', label: 'International' },
  ];

  useEffect(() => {
    const fetchServiceType = async () => {
      try {
        const response = await fetch(`/api/shipping-service-types/${serviceTypeId}`);
        if (!response.ok) throw new Error('Failed to fetch service type');
        
        const data = await response.json();
        setServiceType(data);
        setFormData({
          name: data.name || '',
          code: data.code || '',
          description: data.description || '',
          category: data.category || '',
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder || 0,
        });
      } catch (error) {
        console.error('Error fetching service type:', error);
        setError('Failed to load service type data');
      }
    };

    fetchServiceType();
  }, [serviceTypeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/shipping-service-types/${serviceType.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update service type');
      }

      router.push('/shipping-service-types');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!serviceType) return;
    
    if (confirm('Are you sure you want to delete this service type? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/shipping-service-types/${serviceType.id}`, { method: 'DELETE' });
        if (response.ok) {
          router.push('/shipping-service-types');
        } else {
          throw new Error('Failed to delete service type');
        }
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const toggleActive = async () => {
    if (!serviceType) return;
    
    try {
      const response = await fetch(`/api/shipping-service-types/${serviceType.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isActive: !formData.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update service type status');
      }

      setFormData({ ...formData, isActive: !formData.isActive });
    } catch (error: any) {
      setError(error.message);
    }
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

  if (!serviceType) return <div className="p-8 text-center">Loading service type...</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📦 Edit Service Type</h1>
        <button
          onClick={() => router.push('/shipping-service-types')}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          ← Back to Service Types
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Ground Shipping, Express Delivery"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="code">
                      Service Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., ground, express, overnight"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Optional description of this service type"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="sortOrder">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      id="sortOrder"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active service type
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Service Type'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/shipping-service-types')}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Service Type Info */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Service Type Information</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-600">ID:</span> {serviceType.id}</div>
              <div><span className="text-gray-600">Created:</span> {new Date(serviceType.createdAt).toLocaleDateString()}</div>
              <div><span className="text-gray-600">Updated:</span> {new Date(serviceType.updatedAt).toLocaleDateString()}</div>
              <div>
                <span className="text-gray-600">Category:</span>
                {formData.category ? getCategoryBadge(formData.category) : <span className="ml-2 text-gray-400">None</span>}
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  formData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={toggleActive}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.isActive
                    ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {formData.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                🗑️ Delete Service Type
              </button>
            </div>
          </div>

          {/* Examples */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Examples</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div><strong>Ground:</strong> Standard Ground, Ground Residential</div>
              <div><strong>Express:</strong> Next Day Air, 2-Day Express</div>
              <div><strong>Overnight:</strong> Priority Overnight, Standard Overnight</div>
              <div><strong>International:</strong> International Priority, International Economy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 