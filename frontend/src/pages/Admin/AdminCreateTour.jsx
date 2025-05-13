import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

import AdminNavbar from "../../components/admin/AdminNavbar.jsx"

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Tour name is required')
    .max(100, 'Tour name cannot exceed 100 characters'),
  duration: Yup.number()
    .required('Duration is required')
    .min(1, 'Duration must be at least 1 day')
    .integer('Duration must be a whole number'),
  maxGroupSize: Yup.number()
    .required('Group size is required')
    .min(1, 'Group size must be at least 1')
    .integer('Group size must be a whole number'),
  difficulty: Yup.string()
    .required('Difficulty is required')
    .oneOf(['easy', 'medium', 'difficult'], 'Difficulty must be easy, medium, or difficult'),
  ratingsAverage: Yup.number()
    .min(1, 'Rating must be at least 1.0')
    .max(5, 'Rating cannot exceed 5.0'),
  price: Yup.number()
    .required('Price is required')
    .min(0, 'Price cannot be negative'),
  priceDiscount: Yup.number()
    .test(
      'is-discount-lower',
      'Discount price must be below regular price',
      function(value) {
        return !value || value < this.parent.price;
      }
    ),
  summary: Yup.string()
    .required('Summary is required')
    .trim(),
  description: Yup.string()
    .trim(),
  imageCover: Yup.mixed()
    .required('Cover image is required'),
  images: Yup.array(),
  startDates: Yup.string()
    .required('Start dates are required'),
  country: Yup.string()
    .required('Country is required'),
  startLocation: Yup.object().shape({
    address: Yup.string(),
    description: Yup.string(),
    coordinates: Yup.array().of(Yup.number())
  }),
  locations: Yup.array().of(
    Yup.object().shape({
      address: Yup.string(),
      description: Yup.string(),
      day: Yup.number().integer('Day must be a whole number'),
      coordinates: Yup.array().of(Yup.number())
    })
  )
});

const AdminCreateTour = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [locations, setLocations] = useState([{ 
    description: '', 
    address: '', 
    coordinates: [0, 0], 
    day: 1 
  }]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Create a FormData object to send files and data
      const formData = new FormData();
      
      // Append cover image
      if (values.imageCover) {
        formData.append('imageCover', values.imageCover);
      }
      
      // Append additional images if any
      if (values.images && values.images.length > 0) {
        values.images.forEach(image => {
          formData.append('images', image);
        });
      }
      
      // Format start dates
      const formattedStartDates = values.startDates
        .split(',')
        .map(date => date.trim())
        .filter(date => date);
      
      // Prepare locations data
      const formattedLocations = locations.map(loc => ({
        type: 'Point',
        coordinates: loc.coordinates,
        address: loc.address,
        description: loc.description,
        day: loc.day
      }));

      // Prepare start location
      const startLocation = {
        type: 'Point',
        coordinates: values.startLocation.coordinates,
        address: values.startLocation.address,
        description: values.startLocation.description
      };

      // Append all other fields as JSON
      const tourData = {
        ...values,
        startDates: formattedStartDates,
        startLocation,
        locations: formattedLocations
      };
      
      // Remove file objects before stringifying
      delete tourData.imageCover;
      delete tourData.images;
      
      formData.append('data', JSON.stringify(tourData));

      // Send the request to your backend API
      // const response = await axios.post('/api/v1/tours', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });

    const token = localStorage.getItem('token');

    if (!token) {
  alert('You must be logged in to create a tour.');
  return;
}
    const response = await axios.post('/api/v1/tours', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });

      resetForm();
      setPreviewImage(null);
      setAdditionalImages([]);
      setLocations([{ description: '', address: '', coordinates: [0, 0], day: 1 }]);
      alert('Tour created successfully!');
    } catch (err) {
      alert('Error creating tour: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocationChange = (index, field, value) => {
    const updatedLocations = [...locations];
    updatedLocations[index][field] = value;
    setLocations(updatedLocations);
  };

  const addLocation = () => {
    setLocations([
      ...locations, 
      { description: '', address: '', coordinates: [0, 0], day: locations.length + 1 }
    ]);
  };

  const removeLocation = (index) => {
    const updatedLocations = [...locations];
    updatedLocations.splice(index, 1);
    // Update day numbers
    updatedLocations.forEach((loc, i) => {
      loc.day = i + 1;
    });
    setLocations(updatedLocations);
  };

  const handleAdditionalImages = (e, setFieldValue) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => URL.createObjectURL(file));
    setAdditionalImages(previews);
    setFieldValue('images', files);
  };

  return (
    <>
    <AdminNavbar/>
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create New Tour</h2>
      <Formik
        initialValues={{
          name: '',
          slug: '',
          duration: '',
          maxGroupSize: '',
          difficulty: 'medium',
          ratingsAverage: 4.5,
          ratingsQuantity: 0,
          price: '',
          priceDiscount: '',
          summary: '',
          description: '',
          imageCover: null,
          images: [],
          startDates: '',
          country: '',
          startLocation: {
            address: '',
            description: '',
            coordinates: [0, 0]
          }
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting, values }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-xl font-semibold">Basic Information</h3>
                <div>
                  <label htmlFor="name" className="block mb-1">Tour Name*</label>
                  <Field
                    name="name"
                    type="text"
                    id="name"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500" />
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="duration" className="block mb-1">Duration (days)*</label>
                    <Field
                      name="duration"
                      type="number"
                      id="duration"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="duration" component="div" className="text-red-500" />
                  </div>

                  <div className="flex-1">
                    <label htmlFor="maxGroupSize" className="block mb-1">Max Group Size*</label>
                    <Field
                      name="maxGroupSize"
                      type="number"
                      id="maxGroupSize"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="maxGroupSize" component="div" className="text-red-500" />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="difficulty" className="block mb-1">Difficulty*</label>
                    <Field
                      as="select"
                      name="difficulty"
                      id="difficulty"
                      className="w-full p-2 border rounded"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="difficult">Difficult</option>
                    </Field>
                    <ErrorMessage name="difficulty" component="div" className="text-red-500" />
                  </div>

                  <div className="flex-1">
                    <label htmlFor="country" className="block mb-1">Country*</label>
                    <Field
                      name="country"
                      type="text"
                      id="country"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="country" component="div" className="text-red-500" />
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-xl font-semibold">Pricing</h3>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="price" className="block mb-1">Price*</label>
                    <Field
                      name="price"
                      type="number"
                      id="price"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="price" component="div" className="text-red-500" />
                  </div>

                  <div className="flex-1">
                    <label htmlFor="priceDiscount" className="block mb-1">Price Discount</label>
                    <Field
                      name="priceDiscount"
                      type="number"
                      id="priceDiscount"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="priceDiscount" component="div" className="text-red-500" />
                  </div>

                  <div className="flex-1">
                    <label htmlFor="ratingsAverage" className="block mb-1">Rating (1-5)</label>
                    <Field
                      name="ratingsAverage"
                      type="number"
                      step="0.1"
                      id="ratingsAverage"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="ratingsAverage" component="div" className="text-red-500" />
                  </div>
                </div>
              </div>

              {/* Tour Description */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-xl font-semibold">Tour Description</h3>
                <div>
                  <label htmlFor="summary" className="block mb-1">Summary*</label>
                  <Field
                    name="summary"
                    as="textarea"
                    id="summary"
                    rows="3"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage name="summary" component="div" className="text-red-500" />
                </div>

                <div>
                  <label htmlFor="description" className="block mb-1">Description</label>
                  <Field
                    name="description"
                    as="textarea"
                    id="description"
                    rows="5"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage name="description" component="div" className="text-red-500" />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-xl font-semibold">Images</h3>
                <div>
                  <label htmlFor="imageCover" className="block mb-1">Cover Image*</label>
                  <input
                    id="imageCover"
                    type="file"
                    onChange={(e) => {
                      setFieldValue('imageCover', e.target.files[0]);
                      if (e.target.files[0]) {
                        setPreviewImage(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="w-full p-2 border rounded"
                  />
                  {previewImage && (
                    <img src={previewImage} alt="Preview" className="mt-2 h-32 object-cover" />
                  )}
                  <ErrorMessage name="imageCover" component="div" className="text-red-500" />
                </div>

                <div>
                  <label htmlFor="images" className="block mb-1">Additional Images</label>
                  <input
                    id="images"
                    type="file"
                    multiple
                    onChange={(e) => handleAdditionalImages(e, setFieldValue)}
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex flex-wrap mt-2 gap-2">
                    {additionalImages.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Preview ${idx}`} 
                        className="h-24 object-cover"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-xl font-semibold">Tour Dates</h3>
                <div>
                  <label htmlFor="startDates" className="block mb-1">Start Dates* (comma separated, e.g., 2023-01-05, 2023-02-15)</label>
                  <Field
                    name="startDates"
                    type="text"
                    id="startDates"
                    placeholder="YYYY-MM-DD, YYYY-MM-DD, ..."
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage name="startDates" component="div" className="text-red-500" />
                </div>
              </div>
              
              {/* Start Location */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-xl font-semibold">Start Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startLocation.description" className="block mb-1">Description</label>
                    <Field
                      name="startLocation.description"
                      type="text"
                      id="startLocation.description"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="startLocation.address" className="block mb-1">Address</label>
                    <Field
                      name="startLocation.address"
                      type="text"
                      id="startLocation.address"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label htmlFor="startLocation.coordinates.0" className="block mb-1">Longitude</label>
                    <Field
                      name="startLocation.coordinates.0"
                      type="number"
                      step="0.000001"
                      id="startLocation.coordinates.0"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label htmlFor="startLocation.coordinates.1" className="block mb-1">Latitude</label>
                    <Field
                      name="startLocation.coordinates.1"
                      type="number"
                      step="0.000001"
                      id="startLocation.coordinates.1"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
              
              {/* Tour Locations */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Tour Locations</h3>
                  <button 
                    type="button" 
                    onClick={addLocation}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    + Add Location
                  </button>
                </div>
                
                {locations.map((location, index) => (
                  <div key={index} className="border p-4 rounded space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Location {index + 1}</h4>
                      {locations.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeLocation(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">Description</label>
                        <input
                          type="text"
                          value={location.description}
                          onChange={(e) => handleLocationChange(index, 'description', e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-1">Address</label>
                        <input
                          type="text"
                          value={location.address}
                          onChange={(e) => handleLocationChange(index, 'address', e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block mb-1">Day</label>
                        <input
                          type="number"
                          value={location.day}
                          onChange={(e) => handleLocationChange(index, 'day', parseInt(e.target.value))}
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <label className="block mb-1">Longitude</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={location.coordinates[0]}
                            onChange={(e) => {
                              const newCoords = [...location.coordinates];
                              newCoords[0] = parseFloat(e.target.value);
                              handleLocationChange(index, 'coordinates', newCoords);
                            }}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block mb-1">Latitude</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={location.coordinates[1]}
                            onChange={(e) => {
                              const newCoords = [...location.coordinates];
                              newCoords[1] = parseFloat(e.target.value);
                              handleLocationChange(index, 'coordinates', newCoords);
                            }}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSubmitting ? 'Creating...' : 'Create Tour'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
    </>
  );
};

export default AdminCreateTour;