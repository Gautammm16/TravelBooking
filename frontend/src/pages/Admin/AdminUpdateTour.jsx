import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import { ThreeDots } from 'react-loader-spinner';
import AdminNavbar from "../../components/admin/AdminNavbar.jsx";

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  duration: Yup.number().required('Required').positive('Must be positive'),
  maxGroupSize: Yup.number().required('Required').positive('Must be positive'),
  difficulty: Yup.string()
    .oneOf(['easy', 'medium', 'difficult'], 'Invalid difficulty')
    .required('Required'),
  price: Yup.number().required('Required').positive('Must be positive'),
  priceDiscount: Yup.number()
    .nullable()
    .transform((value) => (isNaN(value) || value === "" ? null : Number(value)))
    .test('is-less-than-price', 'Discount price must be below regular price', function (value) {
      const { price } = this.parent;
      return value === null || value < price;
    }),
  imageCover: Yup.string().required('Required'),
  country: Yup.string().required('Required'),
  summary: Yup.string().required('Required'),
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
const handleSubmit = async (values, { setSubmitting }) => {
  try {
    const formData = new FormData();

    // Flatten and append all scalar values
    formData.append('name', values.name);
    formData.append('duration', values.duration);
    formData.append('maxGroupSize', values.maxGroupSize);
    formData.append('difficulty', values.difficulty);
    formData.append('ratingsAverage', values.ratingsAverage);
    formData.append('ratingsQuantity', values.ratingsQuantity);
    formData.append('price', values.price);
    formData.append('priceDiscount', values.priceDiscount);
    formData.append('summary', values.summary);
    formData.append('description', values.description);
    formData.append('country', values.country);

    // Cover image
    if (values.imageCover && values.imageCover instanceof File) {
      formData.append('imageCover', values.imageCover);
    }

    // Images array
    if (Array.isArray(values.images)) {
      values.images.forEach(img => {
        if (img instanceof File) {
          formData.append('images', img);
        }
      });
    }

    // Guides
    const guidesArray = Array.isArray(values.guides)
      ? values.guides
      : typeof values.guides === 'string'
        ? values.guides.split(',').map(g => g.trim()).filter(Boolean)
        : [];

    guidesArray.forEach(g => formData.append('guides', g));

    // Start dates
    if (Array.isArray(values.startDates)) {
      values.startDates
        .filter(Boolean)
        .forEach(date => formData.append('startDates', date));
    }

    // Start location (nested)
    if (values.startLocation) {
      formData.append('startLocation[description]', values.startLocation.description);
      formData.append('startLocation[type]', 'Point');
      formData.append('startLocation[coordinates][0]', values.startLocation.coordinates[0]);
      formData.append('startLocation[coordinates][1]', values.startLocation.coordinates[1]);
    }

    // Locations array (nested)
    if (Array.isArray(values.locations)) {
      values.locations.forEach((loc, index) => {
        formData.append(`locations[${index}][description]`, loc.description);
        formData.append(`locations[${index}][type]`, 'Point');
        formData.append(`locations[${index}][coordinates][0]`, loc.coordinates[0]);
        formData.append(`locations[${index}][coordinates][1]`, loc.coordinates[1]);
        formData.append(`locations[${index}][day]`, loc.day);
      });
    }

    console.log('Submitting update with FormData:', [...formData.entries()]);

    const { data } = await api.patch(`/v1/tours/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Response from server:', data);

    if (data.status === 'success') {
      alert('Tour updated successfully!');
      navigate('/admin/tours');
    }
  } catch (err) {
    console.error('Error updating tour:', err);
    setError(err.response?.data?.message || 'Error updating tour');
    alert(`Failed to update tour: ${err.response?.data?.message || 'Unknown error'}`);
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
            onClick={() => navigate('/admin/tours')} 
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
    {/* Sidebar */}
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
              difficulty: tour.difficulty || '',
              price: tour.price || '',
              priceDiscount: tour.priceDiscount || '',
              summary: tour.summary || '',
              description: tour.description || '',
              imageCover: tour.imageCover || '',
              images: Array.isArray(tour.images) ? tour.images : [],
              startDates: Array.isArray(tour.startDates) 
                ? tour.startDates.map(date => date.slice(0, 10)) 
                : [''],
              startLocation: {
                description: tour.startLocation?.description || '',
                address: tour.startLocation?.address || '',
                coordinates: Array.isArray(tour.startLocation?.coordinates) 
                  ? tour.startLocation.coordinates 
                  : [0, 0],
                type: tour.startLocation?.type || 'Point'
              },
              locations: Array.isArray(tour.locations) 
                ? tour.locations.map(loc => ({
                    description: loc.description || '',
                    address: loc.address || '',
                    coordinates: loc.coordinates || [0, 0],
                    day: loc.day || 1,
                    type: loc.type || 'Point'
                  }))
                : [],
              guides: Array.isArray(tour.guides) 
                ? tour.guides.map(g => typeof g === 'object' ? g._id : g) 
                : [],
              country: tour.country || '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block mb-1 font-medium">Tour Name</label>
                  <Field 
                    id="name" 
                    name="name" 
                    type="text" 
                    className="w-full p-2 border rounded" 
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Duration and Group Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="duration" className="block mb-1 font-medium">Duration (days)</label>
                    <Field 
                      id="duration" 
                      name="duration" 
                      type="number" 
                      className="w-full p-2 border rounded" 
                    />
                    <ErrorMessage name="duration" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="maxGroupSize" className="block mb-1 font-medium">Max Group Size</label>
                    <Field 
                      id="maxGroupSize" 
                      name="maxGroupSize" 
                      type="number" 
                      className="w-full p-2 border rounded" 
                    />
                    <ErrorMessage name="maxGroupSize" component="div" className="text-red-500 text-sm" />
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label htmlFor="difficulty" className="block mb-1 font-medium">Difficulty</label>
                  <Field 
                    as="select" 
                    id="difficulty" 
                    name="difficulty" 
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="difficult">Difficult</option>
                  </Field>
                  <ErrorMessage name="difficulty" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Price and Discount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block mb-1 font-medium">Price</label>
                    <Field 
                      id="price" 
                      name="price" 
                      type="number" 
                      className="w-full p-2 border rounded" 
                    />
                    <ErrorMessage name="price" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="priceDiscount" className="block mb-1 font-medium">Price Discount (optional)</label>
                    <Field 
                      id="priceDiscount" 
                      name="priceDiscount" 
                      type="number" 
                      className="w-full p-2 border rounded" 
                    />
                    <ErrorMessage name="priceDiscount" component="div" className="text-red-500 text-sm" />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block mb-1 font-medium">Country</label>
                  <Field 
                    id="country" 
                    name="country" 
                    type="text" 
                    className="w-full p-2 border rounded" 
                  />
                  <ErrorMessage name="country" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Summary and Description */}
                <div>
                  <label htmlFor="summary" className="block mb-1 font-medium">Summary</label>
                  <Field 
                    id="summary" 
                    name="summary" 
                    as="textarea" 
                    rows="2" 
                    className="w-full p-2 border rounded" 
                  />
                  <ErrorMessage name="summary" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                  <label htmlFor="description" className="block mb-1 font-medium">Description (optional)</label>
                  <Field 
                    id="description" 
                    name="description" 
                    as="textarea" 
                    rows="4" 
                    className="w-full p-2 border rounded" 
                  />
                </div>

                {/* Image Cover */}
                <div>
                  <label htmlFor="imageCover" className="block mb-1 font-medium">Cover Image</label>
                  <Field 
                    id="imageCover" 
                    name="imageCover" 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="image-filename.jpg" 
                  />
                  <ErrorMessage name="imageCover" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Images */}
                <div>
                  <label className="block mb-1 font-medium">Additional Images</label>
                  <FieldArray name="images">
                    {({ remove, push }) => (
                      <div className="space-y-2">
                        {values.images.length > 0 ? (
                          values.images.map((image, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Field
                                name={`images[${index}]`}
                                type="text"
                                className="flex-grow p-2 border rounded"
                                placeholder="image-filename.jpg"
                              />
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">No additional images</div>
                        )}
                        <button
                          type="button"
                          onClick={() => push('')}
                          className="mt-2 text-blue-500 hover:text-blue-700"
                        >
                          Add Image
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Start Dates */}
                <div>
                  <label className="block mb-1 font-medium">Start Dates</label>
                  <FieldArray name="startDates">
                    {({ push, remove }) => (
                      <div className="space-y-2">
                        {values.startDates.length > 0 ? (
                          values.startDates.map((date, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Field 
                                type="date" 
                                name={`startDates[${index}]`} 
                                className="flex-grow p-2 border rounded" 
                              />
                              <button 
                                type="button" 
                                onClick={() => remove(index)} 
                                className="p-2 text-red-500 hover:bg-red-100 rounded"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">No start dates</div>
                        )}
                        <button 
                          type="button" 
                          onClick={() => push('')} 
                          className="mt-2 text-blue-500 hover:text-blue-700"
                        >
                          Add Date
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Start Location */}
                <div className="border rounded p-4 bg-gray-50">
                  <h3 className="font-bold mb-3">Start Location</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="startLocation.description" className="block mb-1">Description</label>
                      <Field 
                        id="startLocation.description" 
                        name="startLocation.description" 
                        className="w-full p-2 border rounded" 
                      />
                    </div>
                    <div>
                      <label htmlFor="startLocation.address" className="block mb-1">Address</label>
                      <Field 
                        id="startLocation.address" 
                        name="startLocation.address" 
                        className="w-full p-2 border rounded" 
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Coordinates (lng, lat)</label>
                      <div className="flex space-x-2">
                        <div className="w-1/2">
                          <label htmlFor="startLocation.coordinates[0]" className="text-xs text-gray-500">Longitude</label>
                          <Field 
                            id="startLocation.coordinates[0]" 
                            name="startLocation.coordinates[0]" 
                            type="number" 
                            step="0.000001"
                            className="w-full p-2 border rounded" 
                          />
                        </div>
                        <div className="w-1/2">
                          <label htmlFor="startLocation.coordinates[1]" className="text-xs text-gray-500">Latitude</label>
                          <Field 
                            id="startLocation.coordinates[1]" 
                            name="startLocation.coordinates[1]" 
                            type="number" 
                            step="0.000001"
                            className="w-full p-2 border rounded" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Locations Array */}
                <div className="border rounded p-4 bg-gray-50">
                  <h3 className="font-bold mb-3">Tour Locations</h3>
                  <FieldArray name="locations">
                    {({ push, remove }) => (
                      <div className="space-y-4">
                        {values.locations.length > 0 ? (
                          values.locations.map((loc, index) => (
                            <div key={index} className="border p-3 mb-3 rounded bg-white shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Location #{index + 1}</h4>
                                <button 
                                  type="button" 
                                  onClick={() => remove(index)} 
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block mb-1 text-sm">Description</label>
                                  <Field 
                                    name={`locations[${index}].description`} 
                                    className="w-full p-2 border rounded" 
                                  />
                                </div>
                                
                                <div>
                                  <label className="block mb-1 text-sm">Day</label>
                                  <Field 
                                    name={`locations[${index}].day`} 
                                    type="number" 
                                    min="1"
                                    className="w-full p-2 border rounded" 
                                  />
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <label className="block mb-1 text-sm">Address</label>
                                <Field 
                                  name={`locations[${index}].address`} 
                                  className="w-full p-2 border rounded" 
                                />
                              </div>
                              
                              <div className="mt-2">
                                <label className="block mb-1 text-sm">Coordinates (lng, lat)</label>
                                <div className="flex space-x-2">
                                  <div className="w-1/2">
                                    <label className="text-xs text-gray-500">Longitude</label>
                                    <Field 
                                      name={`locations[${index}].coordinates[0]`} 
                                      type="number" 
                                      step="0.000001"
                                      className="w-full p-2 border rounded" 
                                    />
                                  </div>
                                  <div className="w-1/2">
                                    <label className="text-xs text-gray-500">Latitude</label>
                                    <Field 
                                      name={`locations[${index}].coordinates[1]`} 
                                      type="number" 
                                      step="0.000001"
                                      className="w-full p-2 border rounded" 
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">No locations added</div>
                        )}
                        <button 
                          type="button" 
                          onClick={() => push({ 
                            description: '', 
                            address: '', 
                            coordinates: [0, 0], 
                            day: values.locations.length > 0 
                              ? Math.max(...values.locations.map(l => l.day || 0)) + 1 
                              : 1,
                            type: 'Point' 
                          })} 
                          className="w-full p-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                        >
                          Add Location
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Guides */}
                <div>
                  <label className="block mb-1 font-medium">Tour Guides</label>
                  <FieldArray name="guides">
                    {({ remove, push }) => (
                      <div className="space-y-2">
                        {values.guides.length > 0 ? (
                          values.guides.map((guide, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Field
                                name={`guides[${index}]`}
                                type="text"
                                className="flex-grow p-2 border rounded"
                                placeholder="Guide ID"
                              />
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">No guides assigned</div>
                        )}
                        <button
                          type="button"
                          onClick={() => push('')}
                          className="mt-2 text-blue-500 hover:text-blue-700"
                        >
                          Add Guide
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Submit */}
                <div className="pt-4 border-t flex justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/tours')}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <ThreeDots height="20" width="20" radius="4" color="#fff" visible={true} />
                        <span className="ml-2">Updating...</span>
                      </div>
                    ) : (
                      'Update Tour'
                    )}
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