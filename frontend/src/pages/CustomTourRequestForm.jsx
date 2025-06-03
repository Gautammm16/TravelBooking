import React, { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';

const CustomTourRequestForm = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      destination: '',
      duration: '',
      groupSize: '',
      budget: '',
      preferences: ''
    },
    validate: (values) => {
      const errors = {};
      
      if (!values.destination.trim()) {
        errors.destination = 'Destination is required';
      }
      
      if (!values.duration || values.duration <= 0) {
        errors.duration = 'Duration must be greater than 0';
      }
      
      if (!values.groupSize || values.groupSize <= 0) {
        errors.groupSize = 'Group size must be greater than 0';
      }
      
      if (!values.budget || values.budget <= 0) {
        errors.budget = 'Budget must be greater than 0';
      }
      
      if (selectedDates.length === 0) {
        errors.preferredDates = 'At least one preferred date is required';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const requestData = {
          ...values,
          preferredDates: selectedDates,
          duration: parseInt(values.duration),
          groupSize: parseInt(values.groupSize),
          budget: parseFloat(values.budget)
        };
        
        const res = await axios.post('/api/custom-tour-requests', requestData, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        toast.success('Custom tour request submitted successfully!');
        
        // Reset form
        formik.resetForm();
        setSelectedDates([]);
        setNewDate('');
        
      } catch (err) {
        console.error('Error submitting request:', err);
        toast.error(err.response?.data?.message || 'Failed to submit request');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // Get tomorrow's date for min attribute
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const addNewDate = () => {
    if (!newDate) {
      toast.error('Please select a date');
      return;
    }

    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('Please select a future date');
      return;
    }

    const dateExists = selectedDates.some(date => 
      new Date(date).toDateString() === selectedDate.toDateString()
    );

    if (dateExists) {
      toast.error('This date is already selected');
      return;
    }

    setSelectedDates([...selectedDates, selectedDate.toISOString()]);
    setNewDate('');
    toast.success('Date added successfully');
  };

  const removeDate = (indexToRemove) => {
    setSelectedDates(selectedDates.filter((_, index) => index !== indexToRemove));
    toast.info('Date removed');
  };

  const clearAllDates = () => {
    setSelectedDates([]);
    toast.info('All dates cleared');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Request a Custom Tour
        </h2>
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="destination"
              placeholder="Enter your destination"
              value={formik.values.destination}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formik.touched.destination && formik.errors.destination 
                ? 'border-red-500' 
                : 'border-gray-300'
              }`}
            />
            {formik.touched.destination && formik.errors.destination && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.destination}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="duration"
              placeholder="e.g., 5"
              min="1"
              value={formik.values.duration}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formik.touched.duration && formik.errors.duration 
                ? 'border-red-500' 
                : 'border-gray-300'
              }`}
            />
            {formik.touched.duration && formik.errors.duration && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.duration}</p>
            )}
          </div>

          {/* Preferred Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Dates <span className="text-red-500">*</span>
            </label>
            
            {/* Selected Dates Display */}
            {selectedDates.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Selected Dates ({selectedDates.length}):</h4>
                  <button
                    type="button"
                    onClick={clearAllDates}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDates.map((date, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                      <span className="text-sm text-gray-700">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDate(idx)}
                        className="text-red-500 hover:text-red-700 ml-2 text-lg font-bold"
                        title="Remove date"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Date Picker */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={getTomorrowDate()}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addNewDate}
                className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition duration-200 whitespace-nowrap"
              >
                Add Date
              </button>
            </div>
            
            {formik.errors.preferredDates && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.preferredDates}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Select multiple dates for your preferred travel times</p>
          </div>

          {/* Group Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Size <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="groupSize"
              placeholder="e.g., 4"
              min="1"
              value={formik.values.groupSize}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formik.touched.groupSize && formik.errors.groupSize 
                ? 'border-red-500' 
                : 'border-gray-300'
              }`}
            />
            {formik.touched.groupSize && formik.errors.groupSize && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.groupSize}</p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="budget"
              placeholder="e.g., 2000"
              min="1"
              step="0.01"
              value={formik.values.budget}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formik.touched.budget && formik.errors.budget 
                ? 'border-red-500' 
                : 'border-gray-300'
              }`}
            />
            {formik.touched.budget && formik.errors.budget && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.budget}</p>
            )}
          </div>

          {/* Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferences (Optional)
            </label>
            <textarea
              name="preferences"
              placeholder="Activities, accommodation types, transport preferences, dietary restrictions, accessibility needs..."
              value={formik.values.preferences}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Share any specific requirements or preferences for your tour</p>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting || selectedDates.length === 0}
              className={`font-semibold px-8 py-3 rounded-xl transition duration-200 ${
                isSubmitting || selectedDates.length === 0
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            <span className="text-red-500">*</span> Required fields
          </p>
        </form>
      </div>
    </div>
  );
};

export default CustomTourRequestForm;