import React from 'react';
import { View, Text } from 'react-native';

interface StepIndicatorProps {
  currentStep: number; // 1-indexed
  totalSteps?: number;
  labels?: string[];
}

const DEFAULT_LABELS = ['Purpose', 'Details', 'Contact', 'Confirm'];

export function StepIndicator({
  currentStep,
  totalSteps = 4,
  labels = DEFAULT_LABELS,
}: StepIndicatorProps) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 }}>
      {/* Dots row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <React.Fragment key={i}>
              {/* Dot */}
              <View
                style={{
                  width: isActive ? 28 : 10,
                  height: 10,
                  borderRadius: 99,
                  backgroundColor: isCompleted
                    ? '#2ba89a'
                    : isActive
                    ? '#0D3B5C'
                    : '#CBD5E1',
                }}
              />
              {/* Connector */}
              {i < totalSteps - 1 && (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: isCompleted ? '#2ba89a' : '#E2E8F0',
                    marginHorizontal: 4,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Step label */}
      <Text
        style={{
          textAlign: 'center',
          marginTop: 8,
          fontSize: 12,
          color: '#64748B',
          fontWeight: '500',
          letterSpacing: 0.5,
        }}
      >
        Step {currentStep} of {totalSteps} — {labels[currentStep - 1]}
      </Text>
    </View>
  );
}
