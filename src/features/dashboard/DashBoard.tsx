
import { useState } from 'react';
import axios from 'axios';
import log from 'loglevel';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import ListDocument from './ListDocument';
import './Dashboard.css';

log.setLevel('info');

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface PresignedUrlResponse {
  presigned_url: string;
  s3_key: string;
}

async function uploadFile(
  presignedResponse: PresignedUrlResponse,
  file: File
): Promise<void> {
  // Upload file directly to S3
  await axios.put(presignedResponse.presigned_url, file, {
    headers: {
      'Content-Type': file.type,
    },
  });

  // Save document metadata through FastAPI
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  await axios.post(
    `${API_BASE_URL}/api/v1/endpoints/documents`,
    {
      filename: file.name,
      s3_key: presignedResponse.s3_key,
      content_type: file.type,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [listKey, setListKey] = useState(0);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem(
      'fileInput'
    ) as HTMLInputElement;

    const file = fileInput.files?.[0];

    if (!file) {
      setError('Please select a document to upload.');
      return;
    }

    try {
      setUploading(true);
      setMessage('');
      setError('');

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Request S3 presigned URL
      const response = await axios.get<PresignedUrlResponse>(
        `${API_BASE_URL}/api/v1/endpoints/generate_presigned_url`,
        {
          params: {
            filename: file.name,
            expiration: 100,
            content_type: file.type,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Upload file and save metadata
      await uploadFile(response.data, file);

      setMessage('Document uploaded successfully.');
      setListKey((previousKey) => previousKey + 1);

      // Clear selected file
      form.reset();

    } catch (err) {
      log.error('Error uploading document:', err);
      setError('Unable to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      navigate('/');
    } catch (err) {
      log.error('Error signing out:', err);
      setError('Unable to log out. Please try again.');
    }
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <h1>Folio</h1>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <div className="dashboard-container">
        <section className="dashboard-intro">
          <h2>My Documents</h2>
          <p>Manage and share your documents in one place.</p>
        </section>

        <section className="upload-section">
          <h3>Upload a document</h3>

          <form onSubmit={handleSubmit}>
            <input
              type="file"
              name="fileInput"
              disabled={uploading}
            />

            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>

          {message && (
            <p className="upload-success">{message}</p>
          )}

          {error && (
            <p className="upload-error">{error}</p>
          )}
        </section>

        <section className="documents-section">
          <ListDocument key={listKey} />
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
