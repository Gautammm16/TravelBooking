import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 w-full">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-8">
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase dark:text-gray-400">
              Company
            </h2>
            <ul className="text-gray-500 dark:text-gray-400">
              <li className="mb-2">
                <Link to="/about" className="hover:underline">About</Link>
              </li>
              <li className="mb-2">
                <Link to="/destination" className="hover:underline">Destination</Link>
              </li>
              <li className="mb-2">
                <Link to="/gallery" className="hover:underline">Gallery</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact-us" className="hover:underline">Contact us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase dark:text-gray-400">
              Legal
            </h2>
            <ul className="text-gray-500 dark:text-gray-400">
              <li className="mb-2">
                <a href="#" className="hover:underline">Privacy Policy</a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:underline">Licensing</a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:underline">Terms &amp; Conditions</a>
              </li>
            </ul>
          </div>

          {/* Add more sections if needed */}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 py-6">
          <span className="text-sm text-gray-500 dark:text-gray-300 text-center md:text-left">
            © 2025 <a href="#" className="hover:underline">Tour Agency</a>. All Rights Reserved.
          </span>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M22 12c0-5.523...z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Facebook page</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12.315 2c2.43...z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Instagram page</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
