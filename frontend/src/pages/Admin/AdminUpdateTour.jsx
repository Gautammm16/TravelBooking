import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import { ThreeDots } from 'react-loader-spinner';
import AdminNavbar from "../../components/admin/AdminNavbar.jsx";

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Tour name is required'),
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
      'Discount price must be below regular price or 0',
      function(value) {
        // Allow priceDiscount to be 0 or null/undefined, or less than price
        return value === 0 || value === null || value === undefined || value < this.parent.price;
      }
    ),
  summary: Yup.string().required('Summary is required'),
  description: Yup.string(),
  imageCover: Yup.string().required('Cover image is required'),
  images: Yup.array(),
  startDates: Yup.string().required('Start dates are required'),
  country: Yup.string().required('Country is required'),
  startLocation: Yup.object().shape({
    description: Yup.string(),
    coordinates: Yup.array()
      .of(Yup.number())
      .length(2, 'Must have exactly 2 coordinates')
  }),
  locations: Yup.array().of(
    Yup.object().shape({
      description: Yup.string(),
      coordinates: Yup.array()
        .of(Yup.number())
        .length(2, 'Must have exactly 2 coordinates'),
      day: Yup.number()
        .integer('Day must be a whole number')
        .min(1, 'Day must be at least 1')
    })
  )
});

const AdminUpdateTour = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/v1/tours/${id}`);
        setTour(data.data.tour);
        setError(null);
      } catch (err) {
        console.error('Error fetching tour:', err);
        setError(err.response?.data?.message || 'Failed to load tour data');
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

const handleSubmit = async (values, { setSubmitting, setErrors }) => {
  try {
    // Create a clean object with only the data needed for the update
    const updateData = {
      name: values.name,
      duration: Number(values.duration),
      maxGroupSize: Number(values.maxGroupSize),
      difficulty: values.difficulty,
      ratingsAverage: Number(values.ratingsAverage) || 4.5, // default if empty
      price: Number(values.price),
      summary: values.summary,
      country: values.country,
      imageCover: values.imageCover,
      // Handle priceDiscount properly - default to 0 if empty
      priceDiscount: values.priceDiscount === '' ? 0 : Number(values.priceDiscount),
    };

    // Optional fields
    if (values.description) updateData.description = values.description;
    
    // Handle images array - ensure it's always an array
    updateData.images = values.images?.filter(img => img) || [];

    // Handle start dates (convert from string to array)
    if (values.startDates) {
      updateData.startDates = values.startDates
        .split(',')
        .map(date => {
          const trimmed = date.trim();
          return trimmed ? new Date(trimmed).toISOString() : null;
        })
        .filter(date => date !== null && date !== 'Invalid Date');
    }

    // Handle start location with proper coordinate conversion
    if (values.startLocation) {
      updateData.startLocation = {
        type: 'Point',
        description: values.startLocation.description,
        coordinates: [
          Number(values.startLocation.coordinates[0]),
          Number(values.startLocation.coordinates[1])
        ]
      };
    }
    
    // Handle locations with proper data conversion
    if (values.locations && values.locations.length > 0) {
      updateData.locations = values.locations.map(loc => ({
        type: 'Point',
        description: loc.description,
        coordinates: [
          Number(loc.coordinates[0]),
          Number(loc.coordinates[1])
        ],
        day: Number(loc.day)
      }));
    }

    console.log('Final update payload:', JSON.stringify(updateData, null, 2));

    // Send the update request
    const { data } = await api.patch(`/v1/tours/${id}`, updateData);

    if (data.status === 'success') {
      setUpdateSuccess(true);
      setTimeout(() => navigate('/admin/manage-tours'), 1500);
    }
  } catch (err) {
    console.error('Full error:', err);
    console.log('Error response:', err.response?.data);

    // Handle Mongoose validation errors
    if (err.response?.data?.errors) {
      const formErrors = {};
      Object.entries(err.response.data.errors).forEach(([field, message]) => {
        // Convert nested errors to Formik format (e.g., 'startLocation.coordinates')
        const fieldPath = field.includes('.') ? field : field;
        formErrors[fieldPath] = message;
      });
      setErrors(formErrors);
    } 
    // Handle single field errors (like priceDiscount)
    else if (err.response?.data?.field) {
      setErrors({ [err.response.data.field]: err.response.data.message });
    }
    // Handle generic error messages
    else {
      setError(err.response?.data?.message || 'Error updating tour');
    }
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AdminNavbar />
        <div className="mt-8">
          <ThreeDots height="50" width="50" radius="9" color="#3b82f6" visible={true} />
        </div>
      </div>
    );
  }

  if (error && !tour) {
    return (
      <div className="flex flex-col items-center min-h-screen">
        <AdminNavbar />
        <div className="mt-8 text-red-500 text-center">
          <p className="text-xl font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Update Tour</h2>
        
        {updateSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Tour updated successfully!
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {tour && (
          <Formik
            initialValues={{
              name: tour.name || '',
              duration: tour.duration || '',
              maxGroupSize: tour.maxGroupSize || '',
              difficulty: tour.difficulty || 'medium',
              ratingsAverage: tour.ratingsAverage || 4.5,
              price: tour.price || '',
              priceDiscount: tour.priceDiscount || '',
              summary: tour.summary || '',
              description: tour.description || '',
              imageCover: tour.imageCover || '',
              images: tour.images || [],
              startDates: Array.isArray(tour.startDates) 
                ? tour.startDates.join(', ') 
                : '',
              country: tour.country || '',
              startLocation: {
                description: tour.startLocation?.description || '',
                coordinates: tour.startLocation?.coordinates || [0, 0]
              },
              locations: tour.locations?.map(loc => ({
                description: loc.description || '',
                coordinates: loc.coordinates || [0, 0],
                day: loc.day || 1
              })) || []
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Basic Information</h3>
                  
                  <div>
                    <label htmlFor="name" className="block mb-1">Tour Name*</label>
                    <Field
                      name="name"
                      type="text"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="duration" className="block mb-1">Duration (days)*</label>
                      <Field
                        name="duration"
                        type="number"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="duration" component="div" className="text-red-500" />
                    </div>

                    <div>
                      <label htmlFor="maxGroupSize" className="block mb-1">Max Group Size*</label>
                      <Field
                        name="maxGroupSize"
                        type="number"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="maxGroupSize" component="div" className="text-red-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="difficulty" className="block mb-1">Difficulty*</label>
                      <Field
                        as="select"
                        name="difficulty"
                        className="w-full p-2 border rounded"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="difficult">Difficult</option>
                      </Field>
                      <ErrorMessage name="difficulty" component="div" className="text-red-500" />
                    </div>

                    <div>
                      <label htmlFor="country" className="block mb-1">Country*</label>
                      <Field
                        name="country"
                        type="text"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="country" component="div" className="text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Pricing</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="price" className="block mb-1">Price*</label>
                      <Field
                        name="price"
                        type="number"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="price" component="div" className="text-red-500" />
                    </div>

                    <div>
                      <label htmlFor="priceDiscount" className="block mb-1">Price Discount</label>
                      <Field
                        name="priceDiscount"
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder="0"
                      />
                      <div className="text-xs text-gray-500 mt-1">Leave empty or set to 0 for no discount</div>
                      <ErrorMessage name="priceDiscount" component="div" className="text-red-500" />
                    </div>

                    <div>
                      <label htmlFor="ratingsAverage" className="block mb-1">Rating (1-5)</label>
                      <Field
                        name="ratingsAverage"
                        type="number"
                        step="0.1"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="ratingsAverage" component="div" className="text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Tour Description</h3>
                  
                  <div>
                    <label htmlFor="summary" className="block mb-1">Summary*</label>
                    <Field
                      name="summary"
                      as="textarea"
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
                      rows="5"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Images</h3>
                  
                  <div>
                    <label htmlFor="imageCover" className="block mb-1">Cover Image URL*</label>
                    <Field
                      name="imageCover"
                      type="text"
                      className="w-full p-2 border rounded"
                    />
                    {values.imageCover && (
                      <img 
                        src={values.imageCover} 
                        alt="Cover preview" 
                        className="mt-2 h-32 object-cover"
                      />
                    )}
                    <ErrorMessage name="imageCover" component="div" className="text-red-500" />
                  </div>

                  <div>
                    <label className="block mb-1">Additional Images</label>
                    <FieldArray name="images">
                      {({ push, remove }) => (
                        <div className="space-y-2">
                          {values.images.map((image, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Field
                                name={`images[${index}]`}
                                type="text"
                                className="flex-1 p-2 border rounded"
                              />
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => push('')}
                            className="text-blue-500"
                          >
                            Add Image URL
                          </button>
                        </div>
                      )}
                    </FieldArray>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {values.images.filter(img => img).map((img, index) => (
                        <img 
                          key={index} 
                          src={img} 
                          alt={`Preview ${index}`} 
                          className="h-24 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Tour Dates</h3>
                  
                  <div>
                    <label htmlFor="startDates" className="block mb-1">Start Dates* (comma separated)</label>
                    <Field
                      name="startDates"
                      as="textarea"
                      rows="3"
                      className="w-full p-2 border rounded"
                      placeholder="2025-07-05, 2025-08-27, 2026-10-24"
                    />
                    <ErrorMessage name="startDates" component="div" className="text-red-500" />
                  </div>
                </div>

                {/* Start Location */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Start Location</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startLocation.description" className="block mb-1">Description</label>
                      <Field
                        name="startLocation.description"
                        type="text"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startLocation.coordinates.0" className="block mb-1">Longitude</label>
                      <Field
                        name="startLocation.coordinates.0"
                        type="number"
                        step="0.000001"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="startLocation.coordinates.1" className="block mb-1">Latitude</label>
                      <Field
                        name="startLocation.coordinates.1"
                        type="number"
                        step="0.000001"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Locations */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Tour Locations</h3>
                    <button
                      type="button"
                      onClick={() => setFieldValue('locations', [
                        ...values.locations,
                        { description: '', coordinates: [0, 0], day: values.locations.length + 1 }
                      ])}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Add Location
                    </button>
                  </div>
                  
                  <FieldArray name="locations">
                    {({ remove }) => (
                      <div className="space-y-4">
                        {values.locations.map((location, index) => (
                          <div key={index} className="border p-4 rounded">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium">Location {index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block mb-1">Description</label>
                                <Field
                                  name={`locations.${index}.description`}
                                  type="text"
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              
                              <div>
                                <label className="block mb-1">Day</label>
                                <Field
                                  name={`locations.${index}.day`}
                                  type="number"
                                  min="1"
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                              <div>
                                <label className="block mb-1">Longitude</label>
                                <Field
                                  name={`locations.${index}.coordinates.0`}
                                  type="number"
                                  step="0.000001"
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              
                              <div>
                                <label className="block mb-1">Latitude</label>
                                <Field
                                  name={`locations.${index}.coordinates.1`}
                                  type="number"
                                  step="0.000001"
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/tours')}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Tour'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default AdminUpdateTour;