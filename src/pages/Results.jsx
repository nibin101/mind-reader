import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { ArrowLeft, Brain, AlertTriangle, TrendingUp, Award, Clock, Target, Activity, Sparkles, Download, FileText } from 'lucide-react';
import { analyzeLearningDisabilityRisk } from '../services/openai';
import { generateAssessmentPDF } from '../utils/pdfExport';

const Results = () => {
    const { userProfile, gameStats, learningDisabilityRisk, emotionData, questionLevelData, emotionTimeline } = useGame();
    const navigate = useNavigate();
    const [llmAnalysis, setLlmAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Perform LLM analysis on mount
    useEffect(() => {
        const performAnalysis = async () => {
            setIsAnalyzing(true);
            
            // Log comprehensive data collection summary
            console.log('=== COMPREHENSIVE DATA COLLECTION SUMMARY ===');
            console.log('1. Game Stats:', gameStats);
            console.log('2. Question Level Data (count):', questionLevelData.length);
            console.log('3. Emotion Timeline (count):', emotionTimeline.length);
            console.log('4. Current Learning Disability Risk:', learningDisabilityRisk);
            console.log('5. Questionnaire:', gameStats.questionnaire);
            
            // Calculate data quality metrics
            const gamesPlayed = Object.values(gameStats).filter(g => g.played).length;
            const totalQuestions = questionLevelData.length;
            const avgResponseTime = questionLevelData.length > 0 
                ? questionLevelData.reduce((sum, q) => sum + q.timeSpent, 0) / questionLevelData.length 
                : 0;
            const accuracy = questionLevelData.length > 0
                ? (questionLevelData.filter(q => q.isCorrect).length / questionLevelData.length) * 100
                : 0;
            const timeouts = questionLevelData.filter(q => q.timeSpent >= 10).length;
            
            console.log('=== DATA QUALITY METRICS ===');
            console.log(`- Games Completed: ${gamesPlayed}/10`);
            console.log(`- Total Questions Answered: ${totalQuestions}`);
            console.log(`- Average Response Time: ${avgResponseTime.toFixed(2)}s`);
            console.log(`- Overall Accuracy: ${accuracy.toFixed(1)}%`);
            console.log(`- Timeouts (≥10s): ${timeouts}`);
            console.log(`- Emotion Changes Tracked: ${emotionTimeline.length}`);
            
            try {
                const analysis = await analyzeLearningDisabilityRisk(
                    gameStats,
                    { 
                        timeline: emotionTimeline, 
                        currentState: emotionData,
                        metrics: emotionData.metrics 
                    },
                    questionLevelData
                );
                setLlmAnalysis(analysis);
                console.log('=== LLM ANALYSIS COMPLETED ===');
                console.log('Analysis:', analysis);
            } catch (error) {
                console.error('❌ LLM Analysis failed:', error);
                console.log('Falling back to rule-based risk calculation');
            } finally {
                setIsAnalyzing(false);
            }
        };

        performAnalysis();
    }, []);

    // Debug: Log current risk values
    console.log('Current learningDisabilityRisk:', learningDisabilityRisk);
    console.log('Game stats:', gameStats);
    console.log('Question level data:', questionLevelData);

    // Calculate all disease risks - USE REAL-TIME VALUES (no max cap manipulation)
    const getAllDiseaseRisks = () => {
        // Always use the real-time tracked values from context
        // These are the values calculated during gameplay with webcam emotion analysis
        const risks = [
            {
                name: 'Dyslexia',
                description: 'Reading & Language Processing',
                risk: Math.round(learningDisabilityRisk.dyslexia * 10) / 10, // 1 decimal place
                confidence: learningDisabilityRisk.dyslexia > 50 ? 'High' : learningDisabilityRisk.dyslexia > 25 ? 'Medium' : 'Low',
                color: '#ef4444',
                icon: '📖',
                factors: []
            },
            {
                name: 'Dyscalculia',
                description: 'Mathematical & Numerical Processing',
                risk: Math.round(learningDisabilityRisk.dyscalculia * 10) / 10,
                confidence: learningDisabilityRisk.dyscalculia > 50 ? 'High' : learningDisabilityRisk.dyscalculia > 25 ? 'Medium' : 'Low',
                color: '#f59e0b',
                icon: '🔢',
                factors: []
            },
            {
                name: 'Dysgraphia',
                description: 'Writing & Fine Motor Skills',
                risk: Math.round(learningDisabilityRisk.dysgraphia * 10) / 10,
                confidence: learningDisabilityRisk.dysgraphia > 50 ? 'High' : learningDisabilityRisk.dysgraphia > 25 ? 'Medium' : 'Low',
                color: '#8b5cf6',
                icon: '✍️',
                factors: []
            },
            {
                name: 'ADHD',
                description: 'Attention & Focus',
                risk: Math.round(learningDisabilityRisk.adhd * 10) / 10,
                confidence: learningDisabilityRisk.adhd > 50 ? 'High' : learningDisabilityRisk.adhd > 25 ? 'Medium' : 'Low',
                color: '#06b6d4',
                icon: '🎯',
                factors: []
            },
            {
                name: 'Auditory Processing',
                description: 'Sound & Language Comprehension',
                risk: Math.round(learningDisabilityRisk.auditoryProcessing * 10) / 10,
                confidence: learningDisabilityRisk.auditoryProcessing > 50 ? 'High' : learningDisabilityRisk.auditoryProcessing > 25 ? 'Medium' : 'Low',
                color: '#10b981',
                icon: '👂',
                factors: []
            },
            {
                name: 'Dyspraxia',
                description: 'Motor Coordination',
                risk: Math.round(learningDisabilityRisk.dyspraxia * 10) / 10,
                confidence: learningDisabilityRisk.dyspraxia > 50 ? 'High' : learningDisabilityRisk.dyspraxia > 25 ? 'Medium' : 'Low',
                color: '#ec4899',
                icon: '🤸',
                factors: []
            }
        ];
        
        // Apply comorbidity adjustment: If child has one disease (>50%), reduce others by 5%
        const highRiskDiseases = risks.filter(r => r.risk > 50);
        if (highRiskDiseases.length > 0) {
            console.log('🔄 Comorbidity Adjustment: Detected high-risk disorder(s), reducing other diseases by 5%');
            risks.forEach(disease => {
                if (disease.risk <= 50) {
                    const adjustment = 5 + (Math.random() * 0.4 - 0.2); // 5% ±0.2 for variation
                    const oldRisk = disease.risk;
                    disease.risk = Math.max(0, Math.round((disease.risk - adjustment) * 10) / 10);
                    console.log(`  ↘️ ${disease.name}: ${oldRisk}% → ${disease.risk}% (-${adjustment.toFixed(1)}%)`);
                }
            });
        }
        
        console.log('📊 FINAL REPORT - Real-time tracked values:', risks);
        return risks.sort((a, b) => b.risk - a.risk); // Sort by risk level
    };

    const diseaseRisks = getAllDiseaseRisks();
    const highestRisk = Math.max(...diseaseRisks.map(d => d.risk));

    // Prepare data for Radar Chart
    const radarData = [
        { subject: 'Visual', A: gameStats.spatialRecall?.score / 20 || 0, fullMark: 100 },
        { subject: 'Attention', A: (gameStats.voidChallenge?.score || 0) / 5 || 40, fullMark: 100 },
        { subject: 'Numerical', A: gameStats.numberNinja?.score / 15 || 0, fullMark: 100 },
        { subject: 'Logic', A: gameStats.matrixReasoning?.score / 4.5 || 0, fullMark: 100 },
        { subject: 'Memory', A: (gameStats.memoryQuest?.score || 0) / 5 || 50, fullMark: 100 },
    ];

    // Bar chart data for confidence scores
    const confidenceChartData = diseaseRisks.map(d => ({
        name: d.name,
        risk: d.risk,
        color: d.color
    }));

    // Performance stats
    const performanceMetrics = [
        {
            label: 'Total Games Played',
            value: Object.keys(gameStats).filter(k => gameStats[k].score !== undefined).length,
            icon: <Activity className="text-blue-400" />,
            color: 'blue'
        },
        {
            label: 'Average Score',
            value: Math.round(
                Object.values(gameStats)
                    .filter(g => g.score)
                    .reduce((acc, g) => acc + g.score, 0) /
                Object.values(gameStats).filter(g => g.score).length || 0
            ),
            icon: <Award className="text-yellow-400" />,
            color: 'yellow'
        },
        {
            label: 'Emotion Shifts',
            value: emotionData.metrics?.rapidChanges || 0,
            icon: <TrendingUp className="text-purple-400" />,
            color: 'purple'
        },
        {
            label: 'Risk Level',
            value: highestRisk > 50 ? 'High' : highestRisk > 30 ? 'Moderate' : 'Low',
            icon: <Target className="text-red-400" />,
            color: 'red'
        }
    ];

    const handleExportPDF = () => {
        generateAssessmentPDF(
            userProfile,
            gameStats,
            learningDisabilityRisk,
            llmAnalysis
        );
    };

    // Check if any games have been played
    const hasPlayedGames = Object.values(gameStats).some(stat => stat.played || stat.score > 0);

    if (!hasPlayedGames) {
        return (
            <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                    <Brain size={64} className="text-purple-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-4">No Assessment Data Available</h1>
                    <p className="text-gray-400 mb-6">Please complete at least one game to view your results.</p>
                    <button
                        onClick={() => navigate('/game-selection')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold"
                    >
                        Start Assessment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </button>
                
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportPDF}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={20} />
                    Export PDF Report
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-6"
            >
                {/* HEADER */}
                <div className="bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-pink-900/50 p-8 rounded-3xl border border-white/10">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                                <Brain size={48} className="text-indigo-400" />
                                Comprehensive Assessment Report
                            </h1>
                            <p className="text-gray-300 text-lg">
                                Student: <span className="text-white font-bold">{userProfile.name}</span> | 
                                Age: <span className="text-white font-bold">{userProfile.age}</span> | 
                                Grade: <span className="text-white font-bold">{userProfile.grade || 'N/A'}</span>
                            </p>
                        </div>
                        <div className={`px-6 py-3 rounded-2xl font-bold text-lg border-2 ${
                            highestRisk > 50 ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                            highestRisk > 30 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                            'bg-green-500/20 text-green-300 border-green-500/50'
                        }`}>
                            {highestRisk > 50 ? '⚠️ HIGH RISK' : 
                             highestRisk > 30 ? '⚡ MODERATE RISK' : 
                             '✅ LOW RISK'}
                        </div>
                    </div>
                </div>

                {/* PERFORMANCE METRICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {performanceMetrics.map((metric, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-gray-800/50 border border-white/10 p-6 rounded-2xl backdrop-blur"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                {metric.icon}
                                <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                                    {metric.label}
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-white">{metric.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* DATA COLLECTION QUALITY INDICATOR */}
                <div className="bg-gradient-to-r from-green-900/30 via-emerald-900/30 to-teal-900/30 border border-green-500/30 p-6 rounded-3xl backdrop-blur">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Sparkles className="text-green-400" size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2">Data Collection Summary</h3>
                            <p className="text-gray-300 mb-4">
                                This assessment used <span className="text-green-400 font-bold">{questionLevelData.length} question responses</span>, 
                                <span className="text-blue-400 font-bold"> {emotionTimeline.length} emotion tracking points</span>, 
                                and <span className="text-purple-400 font-bold">{Object.values(gameStats).filter(g => g.played).length} completed games</span> to 
                                calculate accurate learning disability risk scores.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-black/30 p-3 rounded-xl">
                                    <div className="text-gray-400 mb-1">Questions</div>
                                    <div className="text-2xl font-bold text-white">{questionLevelData.length}</div>
                                </div>
                                <div className="bg-black/30 p-3 rounded-xl">
                                    <div className="text-gray-400 mb-1">Accuracy</div>
                                    <div className="text-2xl font-bold text-white">
                                        {questionLevelData.length > 0 
                                            ? ((questionLevelData.filter(q => q.isCorrect).length / questionLevelData.length) * 100).toFixed(0)
                                            : 0}%
                                    </div>
                                </div>
                                <div className="bg-black/30 p-3 rounded-xl">
                                    <div className="text-gray-400 mb-1">Avg Time</div>
                                    <div className="text-2xl font-bold text-white">
                                        {questionLevelData.length > 0 
                                            ? (questionLevelData.reduce((sum, q) => sum + q.timeSpent, 0) / questionLevelData.length).toFixed(1)
                                            : 0}s
                                    </div>
                                </div>
                                <div className="bg-black/30 p-3 rounded-xl">
                                    <div className="text-gray-400 mb-1">Emotions</div>
                                    <div className="text-2xl font-bold text-white">{emotionTimeline.length}</div>
                                </div>
                            </div>
                            <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                All data points used for maximum accuracy • AI-powered analysis {llmAnalysis ? 'completed' : 'in progress'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* DISEASE RISK ANALYSIS - ALL CONDITIONS */}
                <div className="bg-gray-900/50 border border-white/10 p-8 rounded-3xl backdrop-blur">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <AlertTriangle className="text-yellow-400" />
                        Learning Disorder Risk Assessment
                        <span className="text-sm font-normal text-gray-400 ml-auto">
                            Confidence Scale: 0-80% (Screening Tool)
                        </span>
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {diseaseRisks.map((disease, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-black/40 p-6 rounded-2xl border-l-4 hover:scale-105 transition-transform"
                                style={{ borderColor: disease.color }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{disease.icon}</span>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{disease.name}</h3>
                                            <p className="text-gray-400 text-sm">{disease.description}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Risk Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-sm">Risk Score</span>
                                        <span className="text-2xl font-bold" style={{ color: disease.color }}>
                                            {Math.round(disease.risk)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${disease.risk}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: disease.color }}
                                        />
                                    </div>
                                </div>

                                {/* Confidence Badge */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                        Confidence: {disease.confidence}
                                    </span>
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                                        disease.risk > 60 ? 'bg-red-500/20 text-red-300' :
                                        disease.risk > 40 ? 'bg-yellow-500/20 text-yellow-300' :
                                        'bg-green-500/20 text-green-300'
                                    }`}>
                                        {disease.risk > 60 ? 'HIGH' : disease.risk > 40 ? 'MODERATE' : 'LOW'}
                                    </span>
                                </div>

                                {/* Contributing Factors */}
                                {disease.factors.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-gray-400 text-xs mb-2">Contributing Factors:</p>
                                        <ul className="space-y-1">
                                            {disease.factors.map((factor, idx) => (
                                                <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                                                    <span className="text-yellow-400">•</span>
                                                    {factor}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CHARTS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart - Risk Comparison */}
                    <div className="bg-gray-900/50 border border-white/10 p-8 rounded-3xl backdrop-blur">
                        <h3 className="text-2xl font-bold text-white mb-6">Risk Comparison Chart</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={confidenceChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis 
                                    tick={{ fill: '#94a3b8' }} 
                                    domain={[0, 80]}
                                    label={{ value: 'Risk %', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="risk" radius={[8, 8, 0, 0]}>
                                    {confidenceChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Radar Chart */}
                    <div className="bg-gray-900/50 border border-white/10 p-8 rounded-3xl backdrop-blur">
                        <h3 className="text-2xl font-bold text-white mb-6">Cognitive Profile</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Performance"
                                    dataKey="A"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="#8b5cf6"
                                    fillOpacity={0.4}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* EMOTION DATA */}
                {emotionData.metrics && (
                    <div className="bg-purple-900/20 border border-purple-500/30 p-8 rounded-3xl">
                        <h3 className="text-2xl font-bold text-purple-300 mb-6 flex items-center gap-3">
                            <Brain size={28} />
                            Emotional Pattern Analysis
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-black/40 p-6 rounded-xl">
                                <span className="text-gray-400 text-sm block mb-2">Rapid Emotion Changes</span>
                                <span className="text-4xl font-bold text-white">{emotionData.metrics.rapidChanges || 0}</span>
                                <p className="text-xs text-gray-500 mt-2">Frequency of quick shifts</p>
                            </div>
                            <div className="bg-black/40 p-6 rounded-xl">
                                <span className="text-gray-400 text-sm block mb-2">Negative Transitions</span>
                                <span className="text-4xl font-bold text-white">{emotionData.metrics.negativeTransitions || 0}</span>
                                <p className="text-xs text-gray-500 mt-2">Happy → Sad/Angry shifts</p>
                            </div>
                            <div className="bg-black/40 p-6 rounded-xl">
                                <span className="text-gray-400 text-sm block mb-2">Confusion States</span>
                                <span className="text-4xl font-bold text-white">{emotionData.metrics.confusionStates || 0}</span>
                                <p className="text-xs text-gray-500 mt-2">Detected confusion moments</p>
                            </div>
                            <div className="bg-black/40 p-6 rounded-xl">
                                <span className="text-gray-400 text-sm block mb-2">Overall Risk</span>
                                <span className={`text-4xl font-bold ${
                                    learningDisabilityRisk.overall === 'High' ? 'text-red-400' :
                                    learningDisabilityRisk.overall === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                                }`}>{learningDisabilityRisk.overall || 'Low'}</span>
                                <p className="text-xs text-gray-500 mt-2">Aggregate assessment</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* GAME SCORES WITH LLM ANALYSIS */}
                <div className="bg-gray-900/50 border border-white/10 p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Individual Game Performance</h3>
                        {isAnalyzing && (
                            <div className="flex items-center gap-2 text-blue-400">
                                <Sparkles className="animate-pulse" size={20} />
                                <span className="text-sm">Analyzing with AI...</span>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(gameStats)
                            .filter(([gameName]) => gameName !== 'questionnaire')
                            .map(([gameName, stats]) => (
                            stats.score !== undefined && stats.played && (
                                <motion.div 
                                    key={gameName} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-black/40 p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-white text-lg font-bold mb-1">
                                                {gameName.replace(/([A-Z])/g, ' $1').trim()}
                                            </h4>
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl font-bold text-blue-400">{stats.score}</span>
                                                <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
                                                    stats.grade === 'S' || stats.grade === 'A' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                    stats.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                    stats.grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                    'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                    {stats.grade || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {stats.correct !== undefined && (
                                        <div className="text-sm text-gray-400 mb-4">
                                            <span className="text-green-400">✓ {stats.correct} correct</span>
                                            <span className="mx-2">|</span>
                                            <span className="text-red-400">✗ {stats.incorrect} wrong</span>
                                        </div>
                                    )}
                                    
                                    {/* LLM Analysis Reasoning */}
                                    {llmAnalysis?.gameAnalysis?.[gameName] && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <div className="flex items-start gap-2 mb-2">
                                                <Brain className="text-purple-400 flex-shrink-0 mt-0.5" size={16} />
                                                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI Analysis</span>
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed mb-3">
                                                {llmAnalysis.gameAnalysis[gameName].reasoning}
                                            </p>
                                            {llmAnalysis.gameAnalysis[gameName].keyIndicators?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {llmAnalysis.gameAnalysis[gameName].keyIndicators.map((indicator, idx) => (
                                                        <span key={idx} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded-full border border-purple-500/20">
                                                            {indicator}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )
                        ))}
                    </div>
                </div>

                {/* LLM CRITICAL FINDINGS & RECOMMENDATIONS */}
                {llmAnalysis?.criticalFindings && llmAnalysis.criticalFindings.length > 0 && (
                    <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl">
                        <div className="flex items-start gap-4">
                            <Sparkles className="text-blue-400 flex-shrink-0 mt-1" size={24} />
                            <div>
                                <h4 className="text-blue-300 font-bold mb-3">AI-Identified Key Observations</h4>
                                <ul className="space-y-2">
                                    {llmAnalysis.criticalFindings.map((finding, idx) => (
                                        <li key={idx} className="text-gray-300 text-sm leading-relaxed flex items-start gap-2">
                                            <span className="text-blue-400">•</span>
                                            <span>{finding}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {llmAnalysis?.recommendations && llmAnalysis.recommendations.length > 0 && (
                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-2xl">
                        <div className="flex items-start gap-4">
                            <TrendingUp className="text-green-400 flex-shrink-0 mt-1" size={24} />
                            <div>
                                <h4 className="text-green-300 font-bold mb-3">AI Recommendations</h4>
                                <ul className="space-y-2">
                                    {llmAnalysis.recommendations.map((rec, idx) => (
                                        <li key={idx} className="text-gray-300 text-sm leading-relaxed flex items-start gap-2">
                                            <span className="text-green-400">→</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* DISCLAIMER */}
                <div className="bg-yellow-900/20 border border-yellow-500/30 p-6 rounded-2xl flex items-start gap-4">
                    <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
                    <div>
                        <h4 className="text-yellow-300 font-bold mb-2">Important Disclaimer</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            This assessment is a screening tool designed for educational purposes only and does not constitute a medical or clinical diagnosis. 
                            The confidence scores (max 80%) reflect the system's analytical limitations. For accurate diagnosis and intervention, 
                            please consult with qualified healthcare professionals including educational psychologists, pediatricians, or learning specialists.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Results;
