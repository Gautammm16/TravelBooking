import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { resetPassword } from '../services/authService'
import { FiLock } from 'react-icons/fi'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Must include an uppercase letter')
      .matches(/[a-z]/, 'Must include a lowercase letter')
      .matches(/[0-9]/, 'Must include a number')
      .required('Password is required'),
    passwordConfirm: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm your password')
  })

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await resetPassword(token, {
        password: values.password,
        passwordConfirm: values.passwordConfirm
      })
      setSuccess('✅ Password reset successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || '❌ Password reset failed')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-md mx-auto mt-20 px-6 py-8 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <FiLock className="mx-auto text-4xl text-blue-600" />
        <h2 className="text-2xl font-semibold mt-2">Reset Your Password</h2>
        <p className="text-gray-500 text-sm">Create a new secure password below</p>
      </div>

      {success && <div className="text-green-600 font-medium text-sm mb-4">{success}</div>}
      {error && <div className="text-red-600 font-medium text-sm mb-4">{error}</div>}

      <Formik
        initialValues={{ password: '', passwordConfirm: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">New Password</label>
              <Field
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-1">Confirm Password</label>
              <Field
                name="passwordConfirm"
                type="password"
                placeholder="••••••••"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage name="passwordConfirm" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
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
