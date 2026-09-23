import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.js';
import { Dumbbell, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
        <Dumbbell className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight">404 — Page Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          The fitness page or resource you are looking for does not exist or has been moved.
        </p>
      </div>

      <Link to="/">
        <Button variant="lime" className="gap-2 font-bold">
          <Home className="w-4 h-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
};
