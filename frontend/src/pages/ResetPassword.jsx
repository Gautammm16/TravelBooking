import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { resetPassword } from '../services/authService'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    passwordConfirm: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm your password')
  })

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await resetPassword(token, values.password)
      setSuccess('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
      {success && <div className="text-green-500 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <Formik
        initialValues={{ password: '', passwordConfirm: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block mb-1">New Password</label>
              <Field name="password" type="password" className="w-full p-2 border rounded" />
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block mb-1">Confirm Password</label>
              <Field name="passwordConfirm" type="password" className="w-full p-2 border rounded" />
              <ErrorMessage name="passwordConfirm" component="div" className="text-red-500 text-sm" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default ResetPassword