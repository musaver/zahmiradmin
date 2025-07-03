'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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

export default function EditShippingCarrier() {
  const router = useRouter();
  const params = useParams();
  const carrierId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [carrier, setCarrier] = useState<ShippingCarrier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    website: '',
    trackingUrl: '',
    apiEndpoint: '',
    apiKey: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    const fetchCarrier = async () => {
      try {
        const response = await fetch(`/api/shipping-carriers/${carrierId}`);
        if (!response.ok) throw new Error('Failed to fetch carrier');
        
        const data = await response.json();
        setCarrier(data);
        setFormData({
          name: data.name || '',
          code: data.code || '',
          description: data.description || '',
          website: data.website || '',
          trackingUrl: data.trackingUrl || '',
          apiEndpoint: data.apiEndpoint || '',
          apiKey: data.apiKey || '',
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder || 0,
        });
      } catch (error) {
        console.error('Error fetching carrier:', error);
        setError('Failed to load carrier data');
      }
    };

    fetchCarrier();
  }, [carrierId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrier) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/shipping-carriers/${carrier.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update carrier');
      }

      router.push('/shipping-carriers');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!carrier) return;
    
    if (confirm('Are you sure you want to delete this carrier? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/shipping-carriers/${carrier.id}`, { method: 'DELETE' });
        if (response.ok) {
          router.push('/shipping-carriers');
        } else {
          throw new Error('Failed to delete carrier');
        }
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const toggleActive = async () => {
    if (!carrier) return;
    
    try {
      const response = await fetch(`/api/shipping-carriers/${carrier.id}`, {
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
        throw new Error('Failed to update carrier status');
      }

      setFormData({ ...formData, isActive: !formData.isActive });
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (!carrier) return <div className="p-8 text-center">Loading carrier...</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🚚 Edit Shipping Carrier</h1>
        <button
          onClick={() => router.push('/shipping-carriers')}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          ← Back to Carriers
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
                      Carrier Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., UPS, FedEx, DHL"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="code">
                      Carrier Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., ups, fedex, dhl"
                      required
                    />
                  </div>
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
                    placeholder="Optional description of this carrier"
                  />
                </div>
              </div>

              {/* Web Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Web Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="website">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.carrier-website.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="trackingUrl">
                    Tracking URL Template
                  </label>
                  <input
                    type="url"
                    id="trackingUrl"
                    name="trackingUrl"
                    value={formData.trackingUrl}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.carrier.com/track?id={tracking_number}"
                  />
                </div>
              </div>

              {/* API Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="apiEndpoint">
                    API Endpoint
                  </label>
                  <input
                    type="url"
                    id="apiEndpoint"
                    name="apiEndpoint"
                    value={formData.apiEndpoint}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://api.carrier.com/v1/"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="apiKey">
                    API Key
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    name="apiKey"
                    value={formData.apiKey}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter API key or token"
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
                      Active carrier
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
                  {loading ? 'Updating...' : 'Update Carrier'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/shipping-carriers')}
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
          {/* Carrier Info */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Carrier Information</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-600">ID:</span> {carrier.id}</div>
              <div><span className="text-gray-600">Created:</span> {new Date(carrier.createdAt).toLocaleDateString()}</div>
              <div><span className="text-gray-600">Updated:</span> {new Date(carrier.updatedAt).toLocaleDateString()}</div>
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
                🗑️ Delete Carrier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 