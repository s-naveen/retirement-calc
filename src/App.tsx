import React, { useState, useEffect } from 'react';
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

  // SEO: Update document title based on current step
  useEffect(() => {
    const baseTitle = 'Retirement Calculator - Plan Your Financial Future';
    const titles = {
      input: baseTitle,
      results: 'Retirement Planning Results - Your Financial Projection | Retirement Calculator'
    };
    document.title = titles[activeStep];
  }, [activeStep]);

  // SEO: Add structured data for the current calculation
  useEffect(() => {
    if (results && retirementData) {
      const calculationData = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": "Retirement Calculation Result",
        "description": `Retirement planning calculation for ${retirementData.retirementAge - retirementData.currentAge} years until retirement`,
        "provider": {
          "@type": "Organization",
          "name": "Retirement Planner"
        }
      };
      
      // Remove existing structured data script if any
      const existingScript = document.getElementById('calculation-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'calculation-structured-data';
      script.textContent = JSON.stringify(calculationData);
      document.head.appendChild(script);
    }
  }, [results, retirementData]);

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
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <motion.header
        className="app-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        role="banner"
      >
        <div className="header-content">
          <div className="logo">
            <TrendingUp className="logo-icon" aria-hidden="true" />
            <h1>Retirement Planner</h1>
          </div>
          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={toggleDarkMode}
              aria-label={`Switch to ${darkMode ? 'light' : 'dark'} theme`}
              title={`Switch to ${darkMode ? 'light' : 'dark'} theme`}
            >
              <span aria-hidden="true">{darkMode ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </motion.header>

      <main className="app-main" role="main" id="main-content">
        <div className="container">
          {/* Progress Indicator */}
          <motion.nav
            className="progress-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            role="navigation"
            aria-label="Calculation progress"
          >
            <div className={`step ${activeStep === 'input' ? 'active' : 'completed'}`}>
              <div className="step-icon">
                <Calculator size={20} aria-hidden="true" />
              </div>
              <span>Input Details</span>
            </div>
            <div className="step-connector" aria-hidden="true"></div>
            <div className={`step ${activeStep === 'results' ? 'active' : ''}`}>
              <div className="step-icon">
                <Target size={20} aria-hidden="true" />
              </div>
              <span>Results</span>
            </div>
          </motion.nav>

          {/* Hero Section */}
          {activeStep === 'input' && (
            <motion.section
              className="hero-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              aria-labelledby="hero-title"
            >
              <h2 id="hero-title">Plan Your Financial Future</h2>
              <p>Calculate how much you need to invest monthly to achieve your retirement goals. Our advanced calculator considers inflation, varying return rates, and helps you visualize your financial journey.</p>
            </motion.section>
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
                <motion.section
                  className="features-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  aria-labelledby="features-title"
                >
                  <h2 id="features-title" className="sr-only">Key Features</h2>
                  <div className="features-grid">
                    <article className="feature-card">
                      <div className="feature-icon">
                        <PiggyBank size={24} aria-hidden="true" />
                      </div>
                      <div className="feature-content">
                        <h3>Smart Calculations</h3>
                        <p>Account for inflation and varying interest rates</p>
                      </div>
                    </article>
                    <article className="feature-card">
                      <div className="feature-icon">
                        <TrendingUp size={24} aria-hidden="true" />
                      </div>
                      <div className="feature-content">
                        <h3>Visual Analytics</h3>
                        <p>Interactive charts and projections</p>
                      </div>
                    </article>
                    <article className="feature-card">
                      <div className="feature-icon">
                        <Settings size={24} aria-hidden="true" />
                      </div>
                      <div className="feature-content">
                        <h3>Advanced Options</h3>
                        <p>Customize with additional investments</p>
                      </div>
                    </article>
                  </div>
                </motion.section>
              </>
            ) : (
              <section className="results-container" aria-labelledby="results-title">
                <h2 id="results-title" className="sr-only">Retirement Planning Results</h2>
                <ResultsDashboard
                  data={retirementData!}
                  results={results!}
                  onRecalculate={() => setActiveStep('input')}
                />
              </section>
            )}
          </motion.div>
        </div>
      </main>

      <footer className="app-footer" role="contentinfo">
        <p>© 2024 Retirement Planner. Built with React & TypeScript.</p>
        <p>
          <small>
            Free retirement planning calculator. Calculate savings, plan investments, and secure your financial future.
          </small>
        </p>
      </footer>
    </div>
  );
};

export default App;
