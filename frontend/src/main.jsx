
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
<GoogleOAuthProvider clientId="1058688869753-ug32b220q6n20fb53gca9ah4ie84q6st.apps.googleusercontent.com">
  <App />
</GoogleOAuthProvider>
)
