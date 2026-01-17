import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LexicalLegends from '../games/LexicalLegends';
import FocusFlight from '../games/FocusFlight';
import NumberNinja from '../games/NumberNinja';
import MatrixReasoning from '../games/MatrixReasoning';
import SpatialRecall from '../games/SpatialRecall';
import HTMLGameWrapper from '../games/HTMLGameWrapper';
import RealTimeRiskDisplay from '../components/RealTimeRiskDisplay';
import { voidChallengeHTML, memoryQuestHTML, treasureHunterHTML, defenderChallengeHTML, warpExplorerHTML, bridgeGameHTML } from '../games/htmlGames';
import { ArrowLeft, Eye } from 'lucide-react';
import { useGame } from '../context/GameContext';

const GameLayout = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { emotionData, learningDisabilityRisk } = useGame();
    const [lastRiskChange, setLastRiskChange] = useState(null);
    const [prevRisks, setPrevRisks] = useState(learningDisabilityRisk);

    // Track risk changes
    useEffect(() => {
        // Detect which risk changed
        const changes = [];
        Object.keys(learningDisabilityRisk).forEach(key => {
            if (key !== 'overall' && learningDisabilityRisk[key] !== prevRisks[key]) {
                changes.push({
                    type: key,
                    delta: Math.round((learningDisabilityRisk[key] - prevRisks[key]) * 10) / 10
                });
            }
        });

        if (changes.length > 0) {
            // Show the most significant change
            const significantChange = changes.reduce((max, change) => 
                Math.abs(change.delta) > Math.abs(max.delta) ? change : max
            );
            setLastRiskChange(significantChange);

            // Clear after 3 seconds
            const timer = setTimeout(() => setLastRiskChange(null), 3000);
            
            setPrevRisks(learningDisabilityRisk);
            
            return () => clearTimeout(timer);
        }
    }, [learningDisabilityRisk, prevRisks]);

    // Get the assessment game sequence if it exists
    const getNextGame = () => {
        const assessmentGames = JSON.parse(sessionStorage.getItem('assessmentGames') || '[]');
        if (assessmentGames.length > 0) {
            const currentIndex = assessmentGames.indexOf(gameId);
            if (currentIndex !== -1 && currentIndex < assessmentGames.length - 1) {
                return assessmentGames[currentIndex + 1];
            }
            // If it's the last game, go to results
            if (currentIndex === assessmentGames.length - 1) {
                return 'results';
            }
            // If current game is not in the list, go to results
            if (currentIndex === -1) {
                return 'results';
            }
        }
        // If no custom sequence, go directly to results after any game
        return 'results';
    };

    const nextGame = getNextGame();

    // Check if this game should be played based on selection
    const assessmentGames = JSON.parse(sessionStorage.getItem('assessmentGames') || '[]');
    const isGameSelected = assessmentGames.length === 0 || assessmentGames.includes(gameId);

    // If game is not selected, redirect to next game or dashboard
    React.useEffect(() => {
        if (!isGameSelected) {
            const nextGameId = getNextGame();
            if (nextGameId === 'results') {
                navigate('/results');
            } else {
                navigate(`/play/${nextGameId}`);
            }
        }
    }, [gameId, isGameSelected]);

    // Don't render if game is not selected
    if (!isGameSelected) {
        return null;
    }

    const getEmotionColor = (emotion) => {
        const colors = {
            happy: 'text-green-400',
            neutral: 'text-blue-400',
            sad: 'text-purple-400',
            fearful: 'text-yellow-400',
            angry: 'text-red-400',
            surprised: 'text-pink-400',
            disgusted: 'text-orange-400'
        };
        return colors[emotion] || 'text-gray-400';
    };

    const renderGame = () => {
        switch (gameId) {
            case 'lexical-legends':
                return <LexicalLegends />;
            case 'focus-flight':
                return <FocusFlight />;
            case 'number-ninja':
                return <NumberNinja />;
            case 'void-challenge':
                return <HTMLGameWrapper gameId="voidChallenge" htmlContent={voidChallengeHTML} nextGame={nextGame} />;
            case 'memory-quest':
                return <HTMLGameWrapper gameId="memoryQuest" htmlContent={memoryQuestHTML} nextGame={nextGame} />;
            case 'warp-explorer':
                return <HTMLGameWrapper gameId="warpExplorer" htmlContent={warpExplorerHTML} nextGame={nextGame} />;
            case 'bridge-game':
                return <HTMLGameWrapper gameId="bridgeGame" htmlContent={bridgeGameHTML} nextGame={nextGame} />;
            case 'treasure-hunter':
                return <HTMLGameWrapper gameId="treasureHunter" htmlContent={treasureHunterHTML} nextGame={nextGame} />;
            case 'defender-challenge':
                return <HTMLGameWrapper gameId="defenderChallenge" htmlContent={defenderChallengeHTML} nextGame={nextGame} />;
            case 'matrix-reasoning':
                return <MatrixReasoning />;
            case 'spatial-recall':
                return <SpatialRecall />;
            default:
                return <div className="text-white text-center text-2xl mt-20">Game Not Found: {gameId}</div>;
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col relative">
            {/* Real-Time Risk Display - Hidden from user, running in background */}
            <div style={{ display: 'none' }}>
                <RealTimeRiskDisplay risks={learningDisabilityRisk} lastChange={lastRiskChange} />
            </div>
            
            <div className="p-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="mr-2" /> Back to Base
                </button>
            </div>
            
            {/* Emotion Indicator */}
            {emotionData.isActive && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="glass-panel px-4 py-3 rounded-lg border border-primary/30">
                        <div className="flex items-center gap-3">
                            <Eye size={18} className="text-primary animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase">Tracking</span>
                                <span className={`text-sm font-bold capitalize ${getEmotionColor(emotionData.currentEmotion)}`}>
                                    {emotionData.currentEmotion}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex-1 p-4 max-w-screen-lg mx-auto w-full h-[80vh]">
                {renderGame()}
            </div>
        </div>
    );
};

export default GameLayout;
