'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUploader from '../../../components/ImageUploader';

export default function EditCategory() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    sortOrder: 0,
    isActive: true,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategoryAndCategories();
  }, [categoryId]);

  const fetchCategoryAndCategories = async () => {
    try {
      const [categoryRes, categoriesRes] = await Promise.all([
        fetch(`/api/categories/${categoryId}`),
        fetch('/api/categories')
      ]);
      
      const category = await categoryRes.json();
      const categoriesData = await categoriesRes.json();
      
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        parentId: category.parentId || '',
        sortOrder: category.sortOrder || 0,
        isActive: category.isActive !== undefined ? category.isActive : true,
      });
      
      // Filter out current category from parent options to prevent circular reference
      const filteredCategories = categoriesData.filter((cat: any) => cat.id !== categoryId);
      setCategories(filteredCategories);
    } catch (err) {
      console.error(err);
      setError('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
  };

  const handleImageRemove = () => {
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        sortOrder: parseInt(formData.sortOrder.toString()),
        parentId: formData.parentId || null,
      };

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update category');
      }

      router.push('/categories');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="slug">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
            placeholder="auto-generated-from-name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <ImageUploader
            currentImage={formData.image}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            label="Category Image"
            disabled={submitting}
            directory="products"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="parentId">
            Parent Category (Optional)
          </label>
          <select
            id="parentId"
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
          >
            <option value="">No Parent Category</option>
            {categories.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="sortOrder">
            Sort Order
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            Active Category
          </label>
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/categories')}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 