import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import { ThreeDots } from 'react-loader-spinner';
import AdminNavbar from "../../components/admin/AdminNavbar.jsx"

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  duration: Yup.number().required('Required').positive(),
  price: Yup.number().required('Required').positive(),
  difficulty: Yup.string().required('Required'),
  summary: Yup.string().required('Required'),
});

const AdminUpdateTour = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const { data } = await api.get(`/api/v1/tours/${id}`);
        setTour(data.data.tour);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tour:', err);
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { data } = await api.patch(`/api/v1/tours/${id}`, values);
      if (data.status === 'success') {
        alert('Tour updated successfully!');
        setTour(data.data.tour);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating tour');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <ThreeDots
          height="50"
          width="50"
          radius="9"
          color="#3b82f6"
          ariaLabel="three-dots-loading"
          visible={true}
        />
      </div>
    );
  }

  return (
    <>
    <AdminNavbar />

    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Update Tour</h2>
      {tour && (
        <Formik
          initialValues={{
            name: tour.name,
            duration: tour.duration,
            price: tour.price,
            difficulty: tour.difficulty,
            summary: tour.summary,
            description: tour.description,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block mb-2">Tour Name</label>
                <Field
                  name="name"
                  type="text"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="name" component="div" className="text-red-500" />
              </div>

              {/* Other fields can go here, similarly styled */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                {isSubmitting ? (
                  <ThreeDots
                    height="20"
                    width="20"
                    radius="9"
                    color="#fff"
                    ariaLabel="three-dots-loading"
                    visible={true}
                  />
                ) : (
                  'Update Tour'
                )}
              </button>
            </Form>
          )}
        </Formik>
      )}
    </div>
    </>
  );
};

export default AdminUpdateTour;
