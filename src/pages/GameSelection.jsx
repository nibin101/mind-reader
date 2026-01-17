import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { Brain, Play, ChevronRight, Clock, Target } from 'lucide-react';

const GameSelection = () => {
    const navigate = useNavigate();
    const { userProfile } = useGame();

    // Predefined assessment sequence - CORE 4 games for accurate diagnosis
    const assessmentSequence = [
        { 
            id: 'void-challenge', 
            name: 'Void Challenge',
            category: 'ADHD',
            description: 'Sustained attention and impulse control',
            icon: '🎯',
            color: 'from-cyan-500 to-blue-500'
        },
        { 
            id: 'treasure-hunter', 
            name: 'Treasure Hunter',
            category: 'Dyslexia',
            description: 'Word recognition and reading speed',
            icon: '📖',
            color: 'from-red-500 to-pink-500'
        },
        { 
            id: 'defender-challenge', 
            name: 'Defender Challenge',
            category: 'Dyscalculia',
            description: 'Number sense and operations',
            icon: '🔢',
            color: 'from-orange-500 to-yellow-500'
        },
        { 
            id: 'memory-quest', 
            name: 'Memory Quest',
            category: 'Dysgraphia',
            description: 'Visual memory and pattern recognition',
            icon: '✍️',
            color: 'from-purple-500 to-indigo-500'
        }
    ];

    const startAssessment = () => {
        const gamesToPlay = assessmentSequence.map(g => g.id);
        
        // Store the sequence in sessionStorage
        sessionStorage.setItem('assessmentGames', JSON.stringify(gamesToPlay));
        sessionStorage.setItem('assessmentMode', 'sequential');
        
        // Navigate to first game
        navigate(`/play/${gamesToPlay[0]}`);
    };

    const totalQuestions = assessmentSequence.length * 3; // 3 questions per game
    const estimatedDuration = assessmentSequence.length * 3; // ~3 min per game

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Brain size={64} className="text-white" />
                    </motion.div>
                    
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Quick Assessment - 4 Core Games
                    </h1>
                    <p className="text-xl text-gray-300 mb-6">
                        Welcome, {userProfile.name}! Complete these {assessmentSequence.length} essential games for accurate diagnosis.
                    </p>
                    
                    {/* Stats */}
                    <div className="flex gap-8 justify-center items-center text-white">
                        <div className="flex items-center gap-2">
                            <Target size={24} className="text-blue-400" />
                            <span className="text-lg">{assessmentSequence.length} Games</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChevronRight size={24} className="text-purple-400" />
                            <span className="text-lg">{totalQuestions} Questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={24} className="text-green-400" />
                            <span className="text-lg">~{estimatedDuration} minutes</span>
                        </div>
                    </div>
                </div>

                {/* Game Sequence Display */}
                <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
                    <h2 className="text-3xl font-bold text-white mb-6 text-center">Core Assessment - 4 Games</h2>
                    <p className="text-gray-400 text-center mb-8">
                        Each game tests a specific learning area. After completing all 4, you'll receive a comprehensive evaluation report.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assessmentSequence.map((game, index) => (
                            <motion.div
                                key={game.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative p-6 rounded-2xl bg-gradient-to-br ${game.color} text-white shadow-lg`}
                            >
                                <div className="absolute top-4 left-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                                    {index + 1}
                                </div>
                                <div className="text-4xl mb-3 text-center">{game.icon}</div>
                                <h3 className="text-xl font-bold mb-2 text-center">{game.name}</h3>
                                <p className="text-sm text-white/80 mb-2 text-center">{game.description}</p>
                                <div className="text-xs text-white/70 text-center">
                                    <span className="font-semibold">{game.category}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Start Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white text-center"
                >
                    <h3 className="text-2xl font-bold mb-4">Ready to Begin?</h3>
                    <p className="text-white/90 mb-6">
                        This streamlined assessment tests 4 core cognitive areas: Attention (ADHD), Reading (Dyslexia), 
                        Math (Dyscalculia), and Memory (Dysgraphia). After completing all 4 games, 
                        you'll receive a comprehensive evaluation report based on collected data.
                    </p>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startAssessment}
                        className="px-16 py-6 rounded-2xl font-bold text-2xl flex items-center gap-4 mx-auto bg-white text-purple-600 hover:shadow-2xl shadow-xl"
                    >
                        <Play size={36} />
                        Start 4-Game Assessment
                    </motion.button>
                    
                    <p className="text-sm text-white/70 mt-6">
                        💡 Only 4 games • ~12 minutes • Instant AI-powered evaluation after completion
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default GameSelection;
