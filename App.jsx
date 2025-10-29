import React, { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import Dashboard from './components/Dashboard';
import LoadingOverlay from './components/LoadingOverlay';
import AuthScreen from './components/AuthScreen';
import './style.css';
import { prepareQuiz } from './quizEngine';

const HIGH_KEY = 'quiz_high_score';
const GAMES_KEY = 'quiz_games_played';
const PLAYERS_KEY = 'quiz_players_data';

const App = () => {
    const [currentScreen, setCurrentScreen] = useState('auth');
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [result, setResult] = useState(null);
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const user = localStorage.getItem('quiz_current_user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    });
    const [players, setPlayers] = useState(() => {
        try {
            const raw = localStorage.getItem(PLAYERS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    });

    // initialize stats from localStorage
    const [highScore, setHighScore] = useState(() => {
        const v = parseInt(localStorage.getItem(HIGH_KEY), 10);
        return Number.isFinite(v) ? v : 0;
    });
    const [gamesPlayed, setGamesPlayed] = useState(() => {
        const v = parseInt(localStorage.getItem(GAMES_KEY), 10);
        return Number.isFinite(v) ? v : 0;
    });

    const startQuiz = (category) => {
        setLoading(true);
        setTimeout(() => {
            const prepared = prepareQuiz(category, 10);
            setQuizData({ category, questions: prepared });
            setLoading(false);
            setCurrentScreen('quiz');
        }, 600);
    };

    const finishQuiz = (resObj) => {
        // update stats
        const newGames = gamesPlayed + 1;
        const newHigh = Math.max(highScore, resObj.score || 0);
        setGamesPlayed(newGames);
        setHighScore(newHigh);
        localStorage.setItem(GAMES_KEY, String(newGames));
        localStorage.setItem(HIGH_KEY, String(newHigh));

        // Automatically save score with current user's name
        if (currentUser) {
            const playerResult = {
                name: currentUser.username,
                score: resObj.score,
                total: resObj.total,
                correct: resObj.correct,
                wrong: resObj.wrong,
                category: resObj.category,
                id: Date.now(),
                date: new Date().toISOString()
            };
            const updatedPlayers = [playerResult, ...players];
            setPlayers(updatedPlayers);
            try {
                localStorage.setItem(PLAYERS_KEY, JSON.stringify(updatedPlayers));
            } catch (e) {
                // ignore
            }
        }

        setResult({ ...resObj, autoSaved: true });
        setCurrentScreen('results');
    };

    const playAgain = () => {
        setResult(null);
        setQuizData(null);
        setCurrentScreen('home');
    };

    const openDashboard = () => setCurrentScreen('dashboard');

    const goHome = () => {
        setResult(null);
        setQuizData(null);
        setCurrentScreen('home');
    };

    // Check auth status on mount
    useEffect(() => {
        if (currentUser) {
            setCurrentScreen('home');
        } else {
            setCurrentScreen('auth');
        }
    }, [currentUser]);

    const handleLogout = () => {
        localStorage.removeItem('quiz_current_user');
        setCurrentUser(null);
        setCurrentScreen('auth');
    };

    const renderHeader = () => {
        if (!currentUser || currentScreen === 'auth') return null;
        return (
            <div className="header">
                <div className="header-main">
                    <h1><i className="fas fa-brain"></i> Multi Quiz Gaming</h1>
                    <p>Test your knowledge across multiple categories!</p>
                </div>
                <div className="user-info">
                    <i className="fas fa-user"></i>
                    <span>{currentUser.username}</span>
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            {loading && <LoadingOverlay />}
            {renderHeader()}
            {currentScreen === 'auth' && <AuthScreen />}
            
            {currentScreen === 'home' && (
                <HomeScreen
                    startQuiz={startQuiz}
                    highScore={highScore}
                    gamesPlayed={gamesPlayed}
                    openDashboard={openDashboard}
                />
            )}
            {currentScreen === 'quiz' && quizData && (
                <QuizScreen quizData={quizData} finishQuiz={finishQuiz} goHome={goHome} />
            )}
            {currentScreen === 'results' && (
                <ResultsScreen result={result} playAgain={playAgain} goHome={goHome} />
            )}
            {currentScreen === 'dashboard' && (
                <Dashboard players={players} goHome={goHome} />
            )}
        </div>
    );
};

export default App;