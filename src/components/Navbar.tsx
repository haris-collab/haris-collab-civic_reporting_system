
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, User, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  'All',
  'Traffic',
  'Road Damage',
  'Water Drainage',
  'Tree Fallen',
  'Street Light Issue',
  'Garbage',
  'Construction',
  'Public Property Damage',
  'Others'
];

interface NavbarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onCreateReport: () => void;
  onAuthClick: () => void;
}

export const Navbar = ({ selectedCategory, onCategoryChange, onCreateReport, onAuthClick }: NavbarProps) => {
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">CivicReport</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {profile?.full_name || user.email}
                </span>
                <Button
                  onClick={onCreateReport}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Report
                </Button>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
            
            {!user && (
              <Button onClick={onAuthClick} size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
        
        {/* Category filters */}
        <div className="pb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
