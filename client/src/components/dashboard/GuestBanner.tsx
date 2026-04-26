import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../ui";

interface GuestBannerProps {
  message: string;
  onClose?: () => void;
}

const GuestBanner = ({ message, onClose }: GuestBannerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <svg
              className="w-5 h-5 text-amber-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-sm font-semibold text-amber-800">
              Guest Mode Active
            </h3>
          </div>
          <p className="text-sm text-stone-600 mb-3">{message}</p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-4 text-stone-400 hover:text-stone-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default GuestBanner;
