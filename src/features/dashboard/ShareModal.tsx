
import axios from 'axios';
import { useState } from 'react';
import './ShareModal.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ShareModalProps {
  document_id: string;
  onClose: () => void;
}

function ShareModal({ document_id, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleShare = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter an email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(
        `${API_BASE_URL}/api/v1/endpoints/documents/${document_id}/share`,
        { email: trimmedEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onClose();
    } catch (err) {
      setError('Unable to share document. Please check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="share-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Share Document</h3>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleShare}>
          <label htmlFor="share-email">
            Email address
          </label>

          <input
            id="share-email"
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={loading}
          />

          {error && <p className="share-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="confirm-share-button"
              disabled={loading}
            >
              {loading ? 'Sharing...' : 'Share document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShareModal;
