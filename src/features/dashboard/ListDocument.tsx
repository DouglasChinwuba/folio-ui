
import axios from 'axios';
import { useEffect, useState } from 'react';
import log from 'loglevel';
import ShareModal from './ShareModal';
import './ListDocument.css';

log.setLevel('info');

interface Document {
  id: string;
  filename: string;
  created_at: string;
  s3_key: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ListDocument() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openShareModal = (documentId: string) => {
    setSelectedDocId(documentId);
    setIsShareOpen(true);
  };

  const closeShareModal = () => {
    setIsShareOpen(false);
    setSelectedDocId(null);
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('User not authenticated');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [ownedResponse, sharedResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/endpoints/get_documents`, {
          headers,
        }),
        axios.get(`${API_BASE_URL}/api/v1/endpoints/shared_documents`, {
          headers,
        }),
      ]);

      setDocuments(ownedResponse.data);
      setSharedDocuments(sharedResponse.data);
    } catch (err) {
      log.error('Error fetching documents:', err);
      setError('Unable to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (documentId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this document?'
    );

    if (!confirmed) return;

    try {
      setDeletingId(documentId);
      setMessage('');
      setError('');

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(
        `${API_BASE_URL}/api/v1/endpoints/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDocuments((previous) =>
        previous.filter((doc) => doc.id !== documentId)
      );

      setMessage('Document deleted successfully.');
    } catch (err) {
      log.error('Error deleting document:', err);
      setError('Unable to delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (documentId: String) => {
	try {
	  const token = localStorage.getItem('token');
  
	  if (!token) {
		throw new Error('No authentication token found');
	  }
  
	  const response = await axios.get(
		`${API_BASE_URL}/api/v1/endpoints/documents/${documentId}/download`,
		{
		  headers: {
			Authorization: `Bearer ${token}`,
		  },
		}
	  );
  
	  const downloadUrl = response.data.download_url;
  
	  const link = document.createElement('a');
	  link.href = downloadUrl;
	  link.download = '';
	  document.body.appendChild(link);
	  link.click();
	  document.body.removeChild(link);
  
	} catch (error) {
	  log.error('Error downloading document:', error);
	  setError('Unable to download document. Please try again.');
	}
  };

  if (loading) {
    return <p className="document-status">Loading documents...</p>;
  }

  return (
    <div className="document-list">

      {error && <p className="document-error">{error}</p>}
      {message && <p className="document-success">{message}</p>}

      <section>
        <h3>My Documents</h3>

        {documents.length === 0 ? (
          <p className="document-empty">
            You haven't uploaded any documents yet.
          </p>
        ) : (
          <ul className="document-items">
            {documents.map((doc) => (
              <li key={doc.id} className="document-item">
                <div className="document-info">
                  <div className="document-icon">
                    <img
                      src="/src/assets/icons/gray-file-icon.png"
                      alt=""
                    />
                  </div>

                  <div className="document-details">
                    <strong>{doc.filename}</strong>
                    <span>
                      Uploaded{' '}
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="document-actions">
				  <button
					className="share-button"
					onClick={() => handleDownload(doc.id)}
				  >
					Download
				  </button>

                  <button
                    className="share-button"
                    onClick={() => openShareModal(doc.id)}
                    aria-label={`Share ${doc.filename}`}
                  >
                    Share
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    aria-label={`Delete ${doc.filename}`}
                  >
                    {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="shared-documents">
        <h3>Shared With Me</h3>

        {sharedDocuments.length === 0 ? (
          <p className="document-empty">
            No documents have been shared with you yet.
          </p>
        ) : (
          <ul className="document-items">
            {sharedDocuments.map((doc) => (
              <li key={doc.id} className="document-item">
                <div className="document-info">
                  <div className="document-icon">
                    <img
                      src="/src/assets/icons/gray-file-icon.png"
                      alt=""
                    />
                  </div>

                  <div className="document-details">
                    <strong>{doc.filename}</strong>
                    <span>
                      Shared document
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isShareOpen && selectedDocId && (
        <ShareModal
          document_id={selectedDocId}
          onClose={closeShareModal}
        />
      )}
    </div>
  );
}

export default ListDocument;
