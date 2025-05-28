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
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Request a Custom Tour</h2>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <input type="text" name="destination" placeholder="Destination" onChange={formik.handleChange} className="w-full p-2 border" />
        <input type="number" name="duration" placeholder="Duration (days)" onChange={formik.handleChange} className="w-full p-2 border" />
        <input type="text" name="preferredDates" placeholder="Preferred Dates (comma separated)" onChange={e => formik.setFieldValue('preferredDates', e.target.value.split(','))} className="w-full p-2 border" />
        <input type="number" name="groupSize" placeholder="Group Size" onChange={formik.handleChange} className="w-full p-2 border" />
        <input type="number" name="budget" placeholder="Budget ($)" onChange={formik.handleChange} className="w-full p-2 border" />
        <textarea name="preferences" placeholder="Preferences (activities, accommodations...)" onChange={formik.handleChange} className="w-full p-2 border"></textarea>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Request</button>
      </form>
    </div>
  );
};

export default CustomTourRequestForm;
