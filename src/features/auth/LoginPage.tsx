
import Header from '../header/Header';
import './LoginPage.css';

function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <h1>Folio</h1>
          <p>Your documents, organized in one place.</p>
        </div>

        <div className="login-content">
          <h2>Welcome to Folio</h2>
          <p>
            Sign in to securely manage, store and share your documents.
          </p>

          <Header />
        </div>

        <footer className="login-footer">
          Simple and secure document management.
        </footer>
      </div>
    </main>
  );
}

export default LoginPage;
