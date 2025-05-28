import React from 'react';
import axios from 'axios';
import { useFormik } from 'formik';

const CustomTourRequestForm = () => {
  const formik = useFormik({
    initialValues: {
      destination: '',
      duration: '',
      preferredDates: [],
      groupSize: '',
      budget: '',
      preferences: ''
    },
    onSubmit: async (values) => {
      try {
        const res = await axios.post('/api/custom-tour-requests', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert('Request submitted!');
      } catch (err) {
        alert('Error: ' + err.response?.data?.message);
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Request a Custom Tour
        </h2>
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input
              type="text"
              name="destination"
              placeholder="Enter your destination"
              onChange={formik.handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
            <input
              type="number"
              name="duration"
              placeholder="e.g., 5"
              onChange={formik.handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Dates</label>
            <input
              type="text"
              name="preferredDates"
              placeholder="e.g., 2025-06-01, 2025-06-15"
              onChange={(e) =>
                formik.setFieldValue('preferredDates', e.target.value.split(','))
              }
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple dates with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Size</label>
            <input
              type="number"
              name="groupSize"
              placeholder="e.g., 4"
              onChange={formik.handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
            <input
              type="number"
              name="budget"
              placeholder="e.g., 2000"
              onChange={formik.handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferences</label>
            <textarea
              name="preferences"
              placeholder="Activities, accommodation types, transport preferences..."
              onChange={formik.handleChange}
              className="w-full p-3 border rounded-lg resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition duration-200"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomTourRequestForm;
