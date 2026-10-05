import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-md"
      >
        <div className="text-8xl font-black text-primary/20 select-none">404</div>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => window.history.back()} className="btn-secondary flex items-center gap-2 text-sm py-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link to="/" className="btn-primary flex items-center gap-2 text-sm py-2">
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
