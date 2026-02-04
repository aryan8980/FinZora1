/**
 * Add Expense Form Component
 * Purpose: Form for adding new expenses with validation and AI categorization
 * Features: Real-time validation, auto-categorization display, error handling
 */

import React, { useState } from 'react';
import { addExpense } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBudgetInvalidation } from '@/hooks/use-budget-invalidation';

interface FormData {
  amount: string;
  merchant: string;
  description: string;
  date: string;
}

interface FormErrors {
  amount?: string;
  merchant?: string;
}

const AddExpense: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { invalidateBudgetQueries } = useBudgetInvalidation();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    merchant: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [predictedCategory, setPredictedCategory] = useState('');

  // ========================================================================
  // VALIDATION LOGIC
  // ========================================================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate amount
    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = 'Amount must be a valid number';
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }

    // Validate merchant
    if (!formData.merchant.trim()) {
      newErrors.merchant = 'Merchant name is required';
    } else if (formData.merchant.length > 100) {
      newErrors.merchant = 'Merchant name is too long (max 100 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================================================
  // AI-BASED CATEGORY PREDICTION
  // ========================================================================

  const predictCategory = (merchantName: string): string => {
    /**
     * Simple rule-based categorization
     * Maps merchant names to expense categories
     */
    const categoryRules: Record<string, string[]> = {
      Food: [
        'mcdonalds',
        'subway',
        'pizza',
        'starbucks',
        'restaurant',
        'cafe',
        'burger'
      ],
      Transport: [
        'uber',
        'ola',
        'lyft',
        'taxi',
        'fuel',
        'petrol',
        'parking'
      ],
      Shopping: [
        'amazon',
        'flipkart',
        'walmart',
        'target',
        'mall',
        'store'
      ],
      Entertainment: [
        'netflix',
        'spotify',
        'cinema',
        'movie',
        'gaming'
      ],
      Utilities: [
        'electricity',
        'water',
        'internet',
        'phone',
        'bill'
      ]
    };

    const normalized = merchantName.toLowerCase();

    for (const [category, keywords] of Object.entries(categoryRules)) {
      if (keywords.some((keyword) => normalized.includes(keyword))) {
        return category;
      }
    }

    return 'Uncategorized';
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Real-time category prediction as merchant name changes
    if (name === 'merchant') {
      setPredictedCategory(predictCategory(value));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Call API to add expense
      const response = await addExpense(
        Number(formData.amount),
        formData.merchant,
        formData.description,
        formData.date
      );

      if (response.success) {
        // Reset form on success
        setFormData({
          amount: '',
          merchant: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        setPredictedCategory('');

        // Show success message
        setSuccessMessage(
          `Expense added successfully! Category: ${response.category}`
        );

        // Invalidate budget queries to update spending stats
        invalidateBudgetQueries();

        // Call callback if provided
        if (onSuccess) onSuccess();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.message || 'Failed to add expense');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <Card className="w-full max-w-md p-6 space-y-4">
      <h2 className="text-2xl font-bold">Add Expense</h2>

      {/* Success Alert */}
      {successMessage && (
        <Alert className="bg-green-100 border-green-400">
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <Alert className="bg-red-100 border-red-400">
          <AlertDescription className="text-red-700">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Amount <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            name="amount"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={errors.amount ? 'border-red-500' : ''}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Merchant Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Merchant <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="merchant"
            placeholder="e.g., McDonald's, Uber, Amazon"
            value={formData.merchant}
            onChange={handleChange}
            className={errors.merchant ? 'border-red-500' : ''}
          />
          {errors.merchant && (
            <p className="text-red-500 text-sm mt-1">{errors.merchant}</p>
          )}

          {/* AI Predicted Category */}
          {formData.merchant && predictedCategory && (
            <p className="text-sm text-blue-600 mt-1">
              📊 Predicted Category: <strong>{predictedCategory}</strong>
            </p>
          )}
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description (Optional)
          </label>
          <textarea
            name="description"
            placeholder="Add any notes..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </Button>
      </form>
    </Card>
  );
};

export default AddExpense;
