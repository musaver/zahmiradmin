'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddStockMovement() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    productId: '',
    variantId: '',
    movementType: 'in',
    quantity: 0,
    reason: '',
    location: '',
    reference: '',
    notes: '',
    costPrice: 0,
    supplier: ''
  });
  
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentInventory, setCurrentInventory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const movementTypes = [
    { value: 'in', label: 'Stock In', icon: '📈', description: 'Add stock (purchase, return, etc.)' },
    { value: 'out', label: 'Stock Out', icon: '📉', description: 'Remove stock (sale, damaged, etc.)' },
    { value: 'adjustment', label: 'Adjustment', icon: '🔧', description: 'Correct inventory discrepancies' }
  ];

  const predefinedReasons = {
    in: [
      'Purchase Order',
      'Stock Return',
      'Initial Stock',
      'Transfer In',
      'Supplier Return',
      'Production Complete',
      'Other'
    ],
    out: [
      'Sale',
      'Damaged Goods',
      'Expired Products',
      'Transfer Out',
      'Customer Return Processed',
      'Theft/Loss',
      'Other'
    ],
    adjustment: [
      'Stock Count Correction',
      'System Error Fix',
      'Found Missing Stock',
      'Reconciliation',
      'Audit Adjustment',
      'Other'
    ]
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formData.productId) {
      fetchProductVariants(formData.productId);
      fetchCurrentInventory();
      const product = products.find((p: any) => p.product.id === formData.productId);
      setSelectedProduct(product);
    } else {
      setVariants([]);
      setSelectedProduct(null);
      setCurrentInventory(null);
    }
  }, [formData.productId, formData.variantId, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductVariants = async (productId: string) => {
    try {
      const response = await fetch(`/api/product-variants?productId=${productId}`);
      const data = await response.json();
      setVariants(data);
    } catch (err) {
      console.error('Error fetching variants:', err);
    }
  };

  const fetchCurrentInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      
      // Find current inventory for the selected product/variant
      const inventory = data.find((item: any) => {
        if (formData.variantId) {
          return item.inventory.variantId === formData.variantId;
        } else {
          return item.inventory.productId === formData.productId && !item.inventory.variantId;
        }
      });
      
      setCurrentInventory(inventory);
    } catch (err) {
      console.error('Error fetching current inventory:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    setFormData({
      ...formData,
      productId,
      variantId: '', // Reset variant when product changes
    });
  };

  const calculateNewQuantity = () => {
    if (!currentInventory) return formData.quantity;
    
    const current = currentInventory.inventory.quantity || 0;
    switch (formData.movementType) {
      case 'in':
        return current + formData.quantity;
      case 'out':
        return current - formData.quantity;
      case 'adjustment':
        return formData.quantity; // For adjustments, quantity is the new total
      default:
        return current;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validation
    if (!formData.productId) {
      setError('Please select a product');
      setSubmitting(false);
      return;
    }

    if (variants.length > 0 && !formData.variantId) {
      setError('Please select a variant for this variable product');
      setSubmitting(false);
      return;
    }

    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      setSubmitting(false);
      return;
    }

    if (!formData.reason) {
      setError('Please provide a reason for this stock movement');
      setSubmitting(false);
      return;
    }

    // Check if stock out would result in negative inventory
    if (formData.movementType === 'out' && currentInventory) {
      const newQuantity = calculateNewQuantity();
      if (newQuantity < 0) {
        setError('This would result in negative inventory. Current stock is not sufficient.');
        setSubmitting(false);
        return;
      }
    }

    try {
      const submitData = {
        ...formData,
        variantId: formData.variantId || null,
      };

      // This would be a new API endpoint for stock movements
      const response = await fetch('/api/inventory/stock-movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create stock movement');
      }

      router.push('/inventory/stock-movements');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const newQuantity = calculateNewQuantity();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📊 Add Stock Movement</h1>
        <button
          onClick={() => router.push('/inventory/stock-movements')}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          ← Back to Stock Movements
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
          <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6">
            {/* Movement Type Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Movement Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {movementTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.movementType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="movementType"
                      value={type.value}
                      checked={formData.movementType === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{type.icon}</span>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Product Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Product Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="productId">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="productId"
                    name="productId"
                    value={formData.productId}
                    onChange={handleProductChange}
                    className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select a product...</option>
                    {products.map((product: any) => (
                      <option key={product.product.id} value={product.product.id}>
                        {product.product.name} {product.product.sku && `(${product.product.sku})`}
                      </option>
                    ))}
                  </select>
                </div>

                {variants.length > 0 && (
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="variantId">
                      Variant <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="variantId"
                      name="variantId"
                      value={formData.variantId}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                      required={variants.length > 0}
                    >
                      <option value="">Select a variant...</option>
                      {variants.map((variant: any) => (
                        <option key={variant.variant.id} value={variant.variant.id}>
                          {variant.variant.title} {variant.variant.sku && `(${variant.variant.sku})`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedProduct && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <h4 className="font-medium text-gray-700 mb-2">Product Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium">{selectedProduct.product.productType || 'Simple'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <span className="ml-2 font-medium">${selectedProduct.product.price}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium">{selectedProduct.category?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Stock:</span>
                      <span className="ml-2 font-medium">
                        {currentInventory ? currentInventory.inventory.quantity : 'No inventory record'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Movement Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Movement Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="quantity">
                    {formData.movementType === 'adjustment' ? 'New Total Quantity' : 'Quantity'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                    min="0"
                    required
                  />
                  {formData.movementType === 'adjustment' && (
                    <p className="text-xs text-gray-500 mt-1">Enter the new total quantity after adjustment</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="reason">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select a reason...</option>
                    {predefinedReasons[formData.movementType as keyof typeof predefinedReasons].map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="location">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                    placeholder="Warehouse, shelf, etc."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="reference">
                    Reference
                  </label>
                  <input
                    type="text"
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                    placeholder="PO number, invoice, etc."
                  />
                </div>

                {formData.movementType === 'in' && (
                  <>
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="costPrice">
                        Cost Price per Unit
                      </label>
                      <input
                        type="number"
                        id="costPrice"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="supplier">
                        Supplier
                      </label>
                      <input
                        type="text"
                        id="supplier"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                        placeholder="Supplier name"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="notes">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                rows={3}
                placeholder="Additional notes about this stock movement..."
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Record Stock Movement'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/inventory/stock-movements')}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">📊 Impact Summary</h3>
            
            <div className="space-y-4">
              {currentInventory && (
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Current Stock</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {currentInventory.inventory.quantity}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded">
                <div className="text-sm text-gray-600">Movement Quantity</div>
                <div className={`text-2xl font-bold ${
                  formData.movementType === 'in' ? 'text-green-800' : 
                  formData.movementType === 'out' ? 'text-red-800' : 'text-blue-800'
                }`}>
                  {formData.movementType === 'in' ? '+' : 
                   formData.movementType === 'out' ? '-' : '±'}
                  {formData.quantity}
                </div>
              </div>

              {currentInventory && (
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-sm text-gray-600">New Stock Level</div>
                  <div className={`text-2xl font-bold ${
                    newQuantity < 0 ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {newQuantity}
                  </div>
                  {newQuantity < 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      ⚠️ This would result in negative inventory
                    </div>
                  )}
                </div>
              )}

              {formData.costPrice > 0 && formData.movementType === 'in' && (
                <div className="p-3 bg-purple-50 rounded">
                  <div className="text-sm text-gray-600">Total Value Added</div>
                  <div className="text-2xl font-bold text-purple-800">
                    ${(formData.quantity * formData.costPrice).toFixed(2)}
                  </div>
                </div>
              )}

              {formData.movementType && formData.reason && (
                <div className="p-3 bg-yellow-50 rounded">
                  <div className="text-sm text-gray-600">Movement Summary</div>
                  <div className="text-sm font-medium">
                    {movementTypes.find(t => t.value === formData.movementType)?.label}: {formData.reason}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 