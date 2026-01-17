import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ArrowRight, Check, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

const questions = [
    {
        id: 'q1',
        text: "Does the child often mix up similar-looking letters (like 'b' and 'd') or numbers (like '6' and '9')?",
        category: 'Reading'
    },
    {
        id: 'q2',
        text: "Is there difficulty reading analog clocks or estimating how much time has passed?",
        category: 'Math'
    },
    {
        id: 'q3',
        text: "Does the child often lose their place while reading or skip lines unintentionally?",
        category: 'Reading'
    },
    {
        id: 'q4',
        text: "Is it challenging to do mental math (like calculating change) without using fingers or paper?",
        category: 'Math'
    },
    {
        id: 'q5',
        text: "Does the child frequently make careless mistakes in schoolwork or overlook details?",
        category: 'Focus'
    },
    {
        id: 'q6',
        text: "Is there difficulty coordinating movements, such as catching a ball or tying shoelaces?",
        category: 'Coordination'
    },
    {
        id: 'q7',
        text: "Does the child struggle to follow multi-step oral instructions?",
        category: 'Listening'
    },
    {
        id: 'q8',
        text: "Does the child seem easily distracted by extraneous stimuli?",
        category: 'Focus'
    }
];

const ParentDashboard = () => {
    const navigate = useNavigate();
    const { submitQuestionnaire } = useGame();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [answers, setAnswers] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnswer = (val) => {
        setAnswers(prev => ({ ...prev, [questions[currentStep].id]: val }));
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsLoading(true);
            finishAssessment();
        }
    };

    const finishAssessment = () => {
        const analysis = {
            dyslexiaScore: (answers['q1'] === 'yes' ? 1 : 0) + (answers['q3'] === 'yes' ? 1 : 0),
            dyscalculiaScore: (answers['q2'] === 'yes' ? 1 : 0) + (answers['q4'] === 'yes' ? 1 : 0),
            adhdScore: (answers['q5'] === 'yes' ? 1 : 0) + (answers['q8'] === 'yes' ? 1 : 0),
            dyspraxiaScore: answers['q6'] === 'yes' ? 1 : 0,
            auditoryScore: answers['q7'] === 'yes' ? 1 : 0
        };
        
        submitQuestionnaire(analysis);
        setTimeout(() => {
            setIsLoading(false);
            setShowQuestionnaire(false);
            alert('Assessment completed! Child can now proceed with games.');
        }, 1000);
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
                <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-primary" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Parent Access</h2>
                    <p className="text-gray-400 mb-8">Enter your secure passcode to view assessment reports.</p>

                    <input
                        type="password"
                        placeholder="Enter Pin (Try 1234)"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white mb-4 focus:border-primary outline-none text-center tracking-widest text-xl"
                    />

                    <button
                        onClick={() => setIsLoggedIn(true)}
                        className="w-full bg-primary py-3 rounded-xl text-white font-bold hover:bg-primary-hover transition-colors"
                    >
                        Unlock Dashboard
                    </button>
                    <button onClick={() => navigate('/')} className="mt-4 text-gray-500 hover:text-white text-sm">Cancel</button>
                </div>
            </div>
        );
    }

    if (showQuestionnaire) {
        const currentQ = questions[currentStep];
        const progress = ((currentStep + 1) / questions.length) * 100;
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full"
                >
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400 text-sm">Question {currentStep + 1} of {questions.length}</span>
                                <span className="text-purple-400 font-bold">{currentQ.category}</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                />
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                            {currentQ.text}
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAnswer('yes')}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                <Check size={24} /> Yes
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAnswer('no')}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white py-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                <ChevronRight size={24} /> No
                            </motion.button>
                        </div>

                        <button
                            onClick={() => {
                                setShowQuestionnaire(false);
                                setCurrentStep(0);
                                setAnswers({});
                            }}
                            className="mt-6 text-gray-400 hover:text-white text-sm"
                        >
                            Cancel Assessment
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-8">
            <header className="flex items-center gap-4 mb-12">
                <button onClick={() => navigate('/')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Parent Dashboard</h1>
                    <p className="text-gray-400">Welcome, Mr. Johnson</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="glass-panel p-8 rounded-3xl border border-white/10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Joseph's Profile</h2>
                            <p className="text-gray-400">Last Assessment: Today</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            J
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                            <span className="text-gray-300">Overall Status</span>
                            <span className="text-yellow-400 font-bold">Analysis Pending</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                            <span className="text-gray-300">Next Recommended Test</span>
                            <span className="text-white">Hearing Screening</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowQuestionnaire(true)}
                        className="w-full mt-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        Start Pre-Assessment <ArrowRight size={16} />
                    </button>
                </div>

                <div className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">+</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Add Child Profile</h3>
                    <p className="text-gray-400 text-sm">Monitor another student's progress</p>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
