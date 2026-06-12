import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-light text-slate-300">404</h1>
        <h2 className="text-xl font-medium text-slate-800">Page introuvable</h2>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
