import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Target, PiggyBank, Settings } from 'lucide-react';
import './App.css';
import RetirementForm from './components/RetirementForm';
import ResultsDashboard from './components/ResultsDashboard';
import { RetirementData, CalculationResults } from './types';

const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState<'input' | 'results'>('input');
  const [retirementData, setRetirementData] = useState<RetirementData | null>(null);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleCalculationComplete = (data: RetirementData, calculationResults: CalculationResults) => {
    setRetirementData(data);
    setResults(calculationResults);
    setActiveStep('results');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', !darkMode ? 'dark' : 'light');
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <motion.header 
        className="app-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="logo">
            <TrendingUp className="logo-icon" />
            <h1>Retirement Planner</h1>
          </div>
          <div className="header-actions">
            <button 
              className="theme-toggle"
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </motion.header>

      <main className="app-main">
        <div className="container">
          {/* Progress Indicator */}
          <motion.div 
            className="progress-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className={`step ${activeStep === 'input' ? 'active' : 'completed'}`}>
              <div className="step-icon">
                <Calculator size={20} />
              </div>
              <span>Input Details</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${activeStep === 'results' ? 'active' : ''}`}>
              <div className="step-icon">
                <Target size={20} />
              </div>
              <span>Results</span>
            </div>
          </motion.div>

          {/* Hero Section */}
          {activeStep === 'input' && (
            <motion.div 
              className="hero-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2>Plan Your Financial Future</h2>
              <p>Calculate how much you need to invest monthly to achieve your retirement goals. Our advanced calculator considers inflation, varying return rates, and helps you visualize your financial journey.</p>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div 
            className="main-content"
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            {activeStep === 'input' ? (
              <>
                <RetirementForm onCalculationComplete={handleCalculationComplete} />
                
                {/* Features Section - Moved below form */}
                <motion.div 
                  className="features-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="features-grid">
                    <div className="feature-card">
                      <div className="feature-icon">
                        <PiggyBank size={24} />
                      </div>
                      <div className="feature-content">
                        <h3>Smart Calculations</h3>
                        <p>Account for inflation and varying interest rates</p>
                      </div>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">
                        <TrendingUp size={24} />
                      </div>
                      <div className="feature-content">
                        <h3>Visual Analytics</h3>
                        <p>Interactive charts and projections</p>
                      </div>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">
                        <Settings size={24} />
                      </div>
                      <div className="feature-content">
                        <h3>Advanced Options</h3>
                        <p>Customize with additional investments</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="results-container">
                <ResultsDashboard 
                  data={retirementData!} 
                  results={results!}
                  onRecalculate={() => setActiveStep('input')}
                />
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2024 Retirement Planner. Built with React & TypeScript.</p>
      </footer>
    </div>
  );
};

export default App;
