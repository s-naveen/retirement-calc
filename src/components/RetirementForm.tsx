import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Info, Plus, X, DollarSign, Percent, Calendar, TrendingUp } from 'lucide-react';
import { RetirementData, AdvancedInvestment, CalculationResults, FormErrors } from '../types';
import { calculateRetirement, formatCurrency } from '../utils/calculations';
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
        const parsed = JSON.parse(savedData);
        // Add backward compatibility for new addAtMaturity field
        if (parsed.advancedInvestments) {
          parsed.advancedInvestments = parsed.advancedInvestments.map((inv: any) => ({
            ...inv,
            name: inv.name || `Investment ${parsed.advancedInvestments.indexOf(inv) + 1}`,
            addAtMaturity: inv.addAtMaturity !== undefined ? inv.addAtMaturity : true
          }));
        }
        return parsed;
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

    // Validate advanced investments
    const yearsToRetirement = formData.retirementAge - formData.currentAge;
    formData.advancedInvestments.forEach((investment, index) => {
      if (investment.amount <= 0) {
        newErrors[`advancedInvestment_${index}_amount`] = `Investment ${index + 1}: Amount must be greater than 0`;
      }
      if (investment.interestRate < 0) {
        newErrors[`advancedInvestment_${index}_rate`] = `Investment ${index + 1}: Interest rate cannot be negative`;
      }
      if (investment.startYear < 0) {
        newErrors[`advancedInvestment_${index}_start`] = `Investment ${index + 1}: Start year cannot be negative`;
      }
      if (investment.startYear >= yearsToRetirement) {
        newErrors[`advancedInvestment_${index}_start`] = `Investment ${index + 1}: Cannot start after retirement`;
      }
      if (investment.timeYears <= 0) {
        newErrors[`advancedInvestment_${index}_duration`] = `Investment ${index + 1}: Duration must be greater than 0`;
      }
    });

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
    const investmentCount = formData.advancedInvestments.length + 1;
    const newInvestment: AdvancedInvestment = {
      id: Date.now().toString(),
      name: `Investment ${investmentCount}`,
      amount: 100000,
      interestRate: 8,
      startYear: 0, // Start immediately
      timeYears: 1,
      addAtMaturity: true // Default to maturity option
    };
    setFormData(prev => ({
      ...prev,
      advancedInvestments: [...prev.advancedInvestments, newInvestment]
    }));
  };

  const updateAdvancedInvestment = (id: string, field: keyof AdvancedInvestment, value: number | string | boolean) => {
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
                  <div className="tooltip" data-tooltip="Your current age in years">
                    <Info size={16} />
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
                  <div className="tooltip" data-tooltip="Age when you plan to retire">
                    <Info size={16} />
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
                  <div className="tooltip" data-tooltip="Age until which you need retirement funds">
                    <Info size={16} />
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
                  <div className="tooltip" data-tooltip="Total amount you have saved so far">
                    <Info size={16} />
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
                  <div className="tooltip" data-tooltip="Monthly pension you expect after retirement (in today's value)">
                    <Info size={16} />
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
                  <div className="tooltip" data-tooltip="Expected average annual inflation rate">
                    <Info size={16} />
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
                  <div className="tooltip" data-tooltip="Expected annual return before retirement">
                    <Info size={16} />
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
                  <div className="tooltip" data-tooltip="Expected annual return after retirement">
                    <Info size={16} />
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
                  <div className="tooltip" data-tooltip="Annual increase in your investment amount">
                    <Info size={16} />
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
            <div className="section-header">
              <div className="section-title">
                <TrendingUp size={24} />
                <h3>Advanced Investments</h3>
              </div>
              <p className="section-description">
                Add special investments with custom returns and timelines to boost your retirement corpus
              </p>
            </div>
            
            <div className="advanced-investments">
              {formData.advancedInvestments.map((investment, index) => (
                <motion.div
                  key={investment.id}
                  className="investment-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="investment-header">
                    <div className="investment-title">
                      <div className="investment-badge">#{index + 1}</div>
                      <div className="investment-name-section">
                        <input
                          type="text"
                          value={investment.name}
                          onChange={(e) => updateAdvancedInvestment(investment.id, 'name', e.target.value)}
                          className="investment-name-input"
                          placeholder={`Investment ${index + 1}`}
                          maxLength={30}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeAdvancedInvestment(investment.id)}
                      title="Remove Investment"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Investment Type Toggle */}
                  <div className="investment-type-section">
                    <div className="form-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={investment.addAtMaturity}
                          onChange={(e) => updateAdvancedInvestment(investment.id, 'addAtMaturity', e.target.checked)}
                          className="toggle-checkbox"
                        />
                        <span className="toggle-slider"></span>
                        <div className="toggle-content">
                          <span className="toggle-title">Add at Maturity</span>
                          <span className="toggle-description">
                            {investment.addAtMaturity
                              ? "Full maturity amount will be added when investment completes"
                              : "Investment grows gradually year by year in your corpus"
                            }
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="investment-fields">
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          Investment Amount
                          <div className="tooltip" data-tooltip="Principal amount to invest">
                            <Info size={16} />
                          </div>
                        </label>
                        <div className="input-wrapper">
                          <DollarSign size={18} className="input-icon" />
                          <input
                            type="number"
                            value={investment.amount}
                            onChange={(e) => updateAdvancedInvestment(investment.id, 'amount', Number(e.target.value))}
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>
                          Annual Return
                          <div className="tooltip" data-tooltip="Expected annual return rate">
                            <Info size={16} />
                          </div>
                        </label>
                        <div className="input-wrapper">
                          <input
                            type="number"
                            value={investment.interestRate}
                            onChange={(e) => updateAdvancedInvestment(investment.id, 'interestRate', Number(e.target.value))}
                            min="0"
                            max="30"
                            step="0.1"
                            placeholder="8.0"
                          />
                          <span className="input-suffix">%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          Start Year
                          <div className="tooltip" data-tooltip="Years from now when investment begins (0 = start immediately)">
                            <Info size={16} />
                          </div>
                        </label>
                        <div className="input-wrapper">
                          <input
                            type="number"
                            value={investment.startYear}
                            onChange={(e) => updateAdvancedInvestment(investment.id, 'startYear', Number(e.target.value))}
                            min="0"
                            max={formData.retirementAge - formData.currentAge}
                            placeholder="0"
                          />
                          <span className="input-suffix">years</span>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>
                          Duration
                          <div className="tooltip" data-tooltip="Investment tenure in years">
                            <Info size={16} />
                          </div>
                        </label>
                        <div className="input-wrapper">
                          <input
                            type="number"
                            value={investment.timeYears}
                            onChange={(e) => updateAdvancedInvestment(investment.id, 'timeYears', Number(e.target.value))}
                            min="1"
                            max="50"
                            placeholder="10"
                          />
                          <span className="input-suffix">years</span>
                        </div>
                      </div>
                    </div>

                    {/* Investment Preview */}
                    <div className="investment-preview">
                      <div className="preview-item">
                        <span className="preview-label">Maturity Value:</span>
                        <span className="preview-value">
                          {formatCurrency(investment.amount * Math.pow(1 + investment.interestRate / 100, investment.timeYears))}
                        </span>
                      </div>
                      <div className="preview-item">
                        <span className="preview-label">Maturity Age:</span>
                        <span className="preview-value">
                          {formData.currentAge + investment.startYear + investment.timeYears} years
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {formData.advancedInvestments.length === 0 && (
                <div className="empty-state">
                  <TrendingUp size={48} className="empty-icon" />
                  <h4>No Advanced Investments</h4>
                  <p>Add special investments to supercharge your retirement planning</p>
                </div>
              )}

              <motion.button
                type="button"
                className="add-investment-btn"
                onClick={addAdvancedInvestment}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={20} />
                Add New Investment
              </motion.button>
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