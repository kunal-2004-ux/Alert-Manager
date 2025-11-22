import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #242424; color: white; font-family: system-ui;">
        <div style="text-align: center; padding: 20px; border: 1px solid #ff4d4f; border-radius: 8px; background: rgba(255, 77, 79, 0.1);">
          <h2 style="color: #ff4d4f;">Configuration Error</h2>
          <p>Missing <code>VITE_CLERK_PUBLISHABLE_KEY</code> environment variable.</p>
          <p>Please add it to <code>frontend/.env</code></p>
        </div>
      </div>
    `;
  }
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>,
)
