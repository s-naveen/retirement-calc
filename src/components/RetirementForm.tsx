import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Info, Plus, X, DollarSign, Percent, Calendar, TrendingUp } from 'lucide-react';
import { RetirementData, AdvancedInvestment, CalculationResults, FormErrors } from '../types';
import { calculateRetirement } from '../utils/calculations';
import './RetirementForm.css';

interface RetirementFormProps {
  onCalculationComplete: (data: RetirementData, results: CalculationResults) => void;
}

const RetirementForm: React.FC<RetirementFormProps> = ({ onCalculationComplete }) => {
  // Load saved data from localStorage or use defaults
  const getInitialFormData = (): RetirementData => {
    const savedData = localStorage.getItem('retirementFormData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
    return {
      currentAge: 27,
      retirementAge: 60,
      fundsNeededTillAge: 80,
      savingsTillNow: 0,
      expectedMonthlyPension: 30000,
      inflationRate: 6.5,
      interestRate: 8,
      afterRetirementInterestRate: 7,
      incrementRate: 6.5,
      advancedInvestments: []
    };
  };

  const [formData, setFormData] = useState<RetirementData>(getInitialFormData());

  const [errors, setErrors] = useState<FormErrors>({});
  const [activeSection, setActiveSection] = useState<'basic' | 'rates' | 'advanced'>('basic');
  const [isCalculating, setIsCalculating] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.currentAge >= formData.retirementAge) {
      newErrors.retirementAge = 'Retirement age must be greater than current age';
    }

    if (formData.retirementAge >= formData.fundsNeededTillAge) {
      newErrors.fundsNeededTillAge = 'Funds needed till age must be greater than retirement age';
    }

    // if (formData.currentAge < 18 || formData.currentAge > 100) {
    //   newErrors.currentAge = 'Current age must be between 18 and 100';
    // }

    if (formData.expectedMonthlyPension < 0) {
      newErrors.expectedMonthlyPension = 'Monthly pension cannot be negative';
    }

    if (formData.savingsTillNow < 0) {
      newErrors.savingsTillNow = 'Current savings cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RetirementData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addAdvancedInvestment = () => {
    const newInvestment: AdvancedInvestment = {
      id: Date.now().toString(),
      amount: 100000,
      interestRate: 8,
      timeYears: 1
    };
    setFormData(prev => ({
      ...prev,
      advancedInvestments: [...prev.advancedInvestments, newInvestment]
    }));
  };

  const updateAdvancedInvestment = (id: string, field: keyof AdvancedInvestment, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      advancedInvestments: prev.advancedInvestments.map(inv =>
        inv.id === id ? { ...inv, [field]: value } : inv
      )
    }));
  };

  const removeAdvancedInvestment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      advancedInvestments: prev.advancedInvestments.filter(inv => inv.id !== id)
    }));
  };

  const handleCalculate = async () => {
    if (!validateForm()) return;

    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const results = calculateRetirement(formData);
      onCalculationComplete(formData, results);
    } catch (error) {
      console.error('Calculation error:', error);
      setErrors({ general: 'An error occurred during calculation. Please check your inputs.' });
    } finally {
      setIsCalculating(false);
    }
  };

  const sections = [
    { id: 'basic', title: 'Basic Information', icon: Calendar },
    { id: 'rates', title: 'Financial Rates', icon: Percent },
    { id: 'advanced', title: 'Advanced Settings', icon: TrendingUp }
  ];

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('retirementFormData', JSON.stringify(formData));
  }, [formData]);

  return (
    <div className="retirement-form">
      {/* Section Navigation */}
      <div className="section-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id as any)}
          >
            <section.icon size={20} />
            <span>{section.title}</span>
          </button>
        ))}
      </div>

      <motion.form 
        className="form-content"
        onSubmit={(e) => { e.preventDefault(); handleCalculate(); }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Basic Information Section */}
        {activeSection === 'basic' && (
          <motion.div 
            className="form-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3><Calendar size={24} /> Basic Information</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="currentAge">
                  Current Age
                  <div className="tooltip">
                    <Info size={16} />
                    <span className="tooltip-text">Your current age in years</span>
                  </div>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="currentAge"
                    value={formData.currentAge}
                    onChange={(e) => handleInputChange('currentAge', Number(e.target.value))}
                    max="100"
                    className={errors.currentAge ? 'error' : ''}
                  />
                  <span className="input-suffix">years</span>
                </div>
                {errors.currentAge && <span className="error-text">{errors.currentAge}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="retirementAge">
                  Retirement Age
                  <div className="tooltip">
                    <Info size={16} />
                    <span className="tooltip-text">Age when you plan to retire</span>
                  </div>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="retirementAge"
                    value={formData.retirementAge}
                    onChange={(e) => handleInputChange('retirementAge', Number(e.target.value))}
                    min="30"
                    max="100"
                    className={errors.retirementAge ? 'error' : ''}
                  />
                  <span className="input-suffix">years</span>
                </div>
                {errors.retirementAge && <span className="error-text">{errors.retirementAge}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="fundsNeededTillAge">
                  Funds Required Until Age
                  <div className="tooltip">
                    <Info size={16} />
                    <span className="tooltip-text">Age until which you need retirement funds</span>
                  </div>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="fundsNeededTillAge"
                    value={formData.fundsNeededTillAge}
                    onChange={(e) => handleInputChange('fundsNeededTillAge', Number(e.target.value))}
                    min="50"
                    max="120"
                    className={errors.fundsNeededTillAge ? 'error' : ''}
                  />
                  <span className="input-suffix">years</span>
                </div>
                {errors.fundsNeededTillAge && <span className="error-text">{errors.fundsNeededTillAge}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="savingsTillNow">
                  Current Savings
                  <div className="tooltip">
                    <Info size={16} />
                    <span className="tooltip-text">Total amount you have saved so far</span>
                  </div>
                </label>
                <div className="input-wrapper">
                  <DollarSign size={20} className="input-icon" />
                  <input
                    type="number"
                    id="savingsTillNow"
                    value={formData.savingsTillNow}
                    onChange={(e) => handleInputChange('savingsTillNow', Number(e.target.value))}
                    min="0"
                    className={errors.savingsTillNow ? 'error' : ''}
                  />
                </div>
                {errors.savingsTillNow && <span className="error-text">{errors.savingsTillNow}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="expectedMonthlyPension">
                  Expected Monthly Pension
                  <div className="tooltip">
                    <Info size={16} />
                    <span className="tooltip-text">Monthly pension you expect after retirement (in today's value)</span>
                  </div>
                </label>
                <div className="input-wrapper">
                  <DollarSign size={20} className="input-icon" />
                  <input
                    type="number"
                    id="expectedMonthlyPension"
                    value={formData.expectedMonthlyPension}
                    onChange={(e) => handleInputChange('expectedMonthlyPension', Number(e.target.value))}
                    min="0"
                    className={errors.expectedMonthlyPension ? 'error' : ''}
                  />
                </div>
                {errors.expectedMonthlyPension && <span className="error-text">{errors.expectedMonthlyPension}</span>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Financial Rates Section */}
        {activeSection === 'rates' && (
          <motion.div 
            className="form-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3><Percent size={24} /> Financial Rates</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="inflationRate">
                  Inflation Rate
                  <div className="tooltip">
                    <Info size={16} />
                    <span className="tooltip-text">Expected average annual inflation rate</span>
                  </div>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="inflationRate"
                    value={formData.inflationRate}
                    onChange={(e) => handleInputChange('inflationRate', Number(e.target.value))}
                    min="0"
                    max="30"
                  />
                  <span className="input-suffix">%</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="interestRate">
                  Pre-Retirement Return Rate
                  <div className="tooltip">
                    <Info size={16} />
                    <span className="tooltip-text">Expected annual return before retirement</span>
                  </div>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="interestRate"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                    min="0"
                    max="30"
                  />
                  <span className="input-suffix">%</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="afterRetirementInterestRate">
                  Post-Retirement Return Rate
                  <div className="tooltip">
                    <Info size={16} />
                    <span className="tooltip-text">Expected annual return after retirement</span>
                  </div>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="afterRetirementInterestRate"
                    value={formData.afterRetirementInterestRate}
                    onChange={(e) => handleInputChange('afterRetirementInterestRate', Number(e.target.value))}
                    min="0"
                    max="30"
                  />
                  <span className="input-suffix">%</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="incrementRate">
                  Investment Increment Rate
                  <div className="tooltip">
                    <Info size={16} />
                    <span className="tooltip-text">Annual increase in your investment amount</span>
                  </div>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="incrementRate"
                    value={formData.incrementRate}
                    onChange={(e) => handleInputChange('incrementRate', Number(e.target.value))}
                    max="300"
                  />
                  <span className="input-suffix">%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Advanced Settings Section */}
        {activeSection === 'advanced' && (
          <motion.div 
            className="form-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3><TrendingUp size={24} /> Advanced Investments</h3>
            
            <div className="advanced-investments">
              {formData.advancedInvestments.map((investment, index) => (
                <motion.div 
                  key={investment.id}
                  className="investment-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="investment-header">
                    <h4>Investment {index + 1}</h4>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeAdvancedInvestment(investment.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="investment-fields">
                    <div className="form-group">
                      <label>Amount</label>
                      <div className="input-wrapper">
                        <DollarSign size={16} className="input-icon" />
                        <input
                          type="number"
                          value={investment.amount}
                          onChange={(e) => updateAdvancedInvestment(investment.id, 'amount', Number(e.target.value))}
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Interest Rate</label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          value={investment.interestRate}
                          onChange={(e) => updateAdvancedInvestment(investment.id, 'interestRate', Number(e.target.value))}
                          min="0"
                          max="30"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Time Period</label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          value={investment.timeYears}
                          onChange={(e) => updateAdvancedInvestment(investment.id, 'timeYears', Number(e.target.value))}
                          min="1"
                          max="50"
                        />
                        <span className="input-suffix">years</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <button
                type="button"
                className="add-investment-btn"
                onClick={addAdvancedInvestment}
              >
                <Plus size={20} />
                Add Investment
              </button>
            </div>
          </motion.div>
        )}

        {errors.general && (
          <div className="error-banner">
            {errors.general}
          </div>
        )}

        <motion.button 
          type="submit"
          className="calculate-btn"
          disabled={isCalculating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Calculator size={20} />
          {isCalculating ? 'Calculating...' : 'Calculate Retirement Plan'}
        </motion.button>
      </motion.form>
    </div>
  );
};

export default RetirementForm; 