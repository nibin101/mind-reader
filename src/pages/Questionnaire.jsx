import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';

const Questionnaire = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-gradient-to-br from-gray-800 to-gray-900 p-12 rounded-3xl shadow-2xl border border-white/10 text-center"
            >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Check className="text-white" size={48} />
                </div>
                
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Ready to Begin!
                </h1>
                
                <p className="text-xl text-gray-300 mb-8">
                    The initial questionnaire has been completed by your parent/guardian.
                    Let's proceed to the assessment games!
                </p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/game-selection')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center gap-3 mx-auto"
                >
                    Start Assessment
                    <ChevronRight size={24} />
                </motion.button>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>
            </motion.div>
        </div>
    );
};

export default Questionnaire;
