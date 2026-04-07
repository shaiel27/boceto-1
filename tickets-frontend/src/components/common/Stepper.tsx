import React from 'react';
import { Check } from 'lucide-react';
import './Stepper.css';

interface Step {
  id: number;
  title: string;
  description?: string;
  status: 'completed' | 'active' | 'pending';
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  size = 'medium'
}) => {
  const getStepClass = (step: Step, index: number) => {
    const baseClass = `stepper-step stepper-step--${step.status}`;
    const sizeClass = `stepper-step--${size}`;
    const orientationClass = `stepper-step--${orientation}`;
    
    return `${baseClass} ${sizeClass} ${orientationClass}`;
  };

  const getConnectorClass = (index: number) => {
    const isCompleted = index < currentStep;
    const baseClass = 'stepper-connector';
    const statusClass = isCompleted ? 'stepper-connector--completed' : 'stepper-connector--pending';
    const orientationClass = `stepper-connector--${orientation}`;
    
    return `${baseClass} ${statusClass} ${orientationClass}`;
  };

  const renderStep = (step: Step, index: number) => {
    const isActive = step.status === 'active';
    const isCompleted = step.status === 'completed';
    const isClickable = onStepClick && (isCompleted || step.id === steps[currentStep]?.id);

    return (
      <div
        key={step.id}
        className={getStepClass(step, index)}
        onClick={() => isClickable && onStepClick(step.id)}
        style={{ cursor: isClickable ? 'pointer' : 'default' }}
      >
        <div className="stepper-step__indicator">
          {isCompleted ? (
            <div className="stepper-step__icon stepper-step__icon--completed">
              <Check size={size === 'small' ? 14 : size === 'large' ? 22 : 18} />
            </div>
          ) : (
            <div className="stepper-step__icon stepper-step__icon--number">
              {index + 1}
            </div>
          )}
        </div>
        
        <div className="stepper-step__content">
          <div className="stepper-step__title">{step.title}</div>
          {step.description && (
            <div className="stepper-step__description">{step.description}</div>
          )}
        </div>

        {index < steps.length - 1 && (
          <div className={getConnectorClass(index)} />
        )}
      </div>
    );
  };

  return (
    <div className={`stepper stepper--${orientation} stepper--${size}`}>
      {steps.map((step, index) => renderStep(step, index))}
    </div>
  );
};

export default Stepper;
