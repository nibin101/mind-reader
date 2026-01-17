import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const RealTimeRiskDisplay = ({ risks, lastChange }) => {
    const getRiskColor = (value) => {
        if (value < 20) return 'from-green-500 to-emerald-600';
        if (value < 40) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-rose-600';
    };

    const getRiskIcon = (change) => {
        if (change > 0) return <TrendingUp className="w-4 h-4" />;
        if (change < 0) return <TrendingDown className="w-4 h-4" />;
        return <AlertCircle className="w-4 h-4" />;
    };

    const displayRisks = [
        { label: 'Dyslexia', value: risks.dyslexia, key: 'dyslexia' },
        { label: 'Dyscalculia', value: risks.dyscalculia, key: 'dyscalculia' },
        { label: 'ADHD', value: risks.adhd, key: 'adhd' },
        { label: 'Dysgraphia', value: risks.dysgraphia, key: 'dysgraphia' }
    ].filter(r => r.value > 0); // Only show non-zero risks

    if (displayRisks.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 right-4 z-50 w-80 max-h-[80vh] overflow-y-auto"
        >
            <div className="bg-gray-900/95 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="text-white font-bold text-sm">Real-Time Risk Assessment</h3>
                </div>

                <div className="space-y-3">
                    <AnimatePresence>
                        {displayRisks.map((risk) => (
                            <motion.div
                                key={risk.key}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300 text-sm font-medium">{risk.label}</span>
                                    <div className="flex items-center gap-2">
                                        {lastChange && lastChange.type === risk.key && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`text-xs px-2 py-1 rounded-full ${
                                                    lastChange.delta > 0 
                                                        ? 'bg-red-500/20 text-red-400' 
                                                        : 'bg-green-500/20 text-green-400'
                                                }`}
                                            >
                                                {lastChange.delta > 0 ? '+' : ''}{lastChange.delta.toFixed(1)}%
                                            </motion.span>
                                        )}
                                        <span className="text-white font-bold text-lg">{risk.value.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(risk.value, 100)}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={`h-full bg-gradient-to-r ${getRiskColor(risk.value)} rounded-full`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Emotion Shift Warning */}
                {risks.adhd > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                    >
                        <p className="text-orange-400 text-xs flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            📹 Webcam: Tracking attention & emotion patterns
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default RealTimeRiskDisplay;
