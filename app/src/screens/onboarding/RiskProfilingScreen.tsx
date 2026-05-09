/**
 * SafeHaven Onboarding — Step 5: Risk Profiling
 *
 * 4 simple, story-based questions with illustrated picture-answer options.
 * Deliberately avoids financial jargon — each scenario is a relatable everyday
 * situation. Answers map to a 1–5 risk score (capped at 3 in v1).
 *
 * Flow:
 *   - One question shown at a time (progress: Q1 → Q2 → Q3 → Q4)
 *   - User taps an answer picture card
 *   - Coco reacts with a brief animated response
 *   - After Q4: score is computed and stored; onNext() fires
 *
 * Questions:
 *   Q1. Market drop scenario  (panic / wait / buy more)
 *   Q2. Found $200 scenario   (emergency fund / spend / invest)
 *   Q3. Time horizon          (< 3 mo / 3–12 mo / 1–3 yr / 3+ yr)
 *   Q4. Emergency fund        (yes, 3m+ / yes, <3m / working on it / no)
 *
 * Accessibility:
 *   - accessibilityRole="radio" on each answer card
 *   - Progress announced: "Question 2 of 4"
 *   - Answer description read on focus (voice-first mode)
 *   - Next button disabled until answer selected
 *   - Correct: no right/wrong framing — "Great choice!" for all answers
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../design/Theme';
import { Button } from '../../design/components/Button';
import { ProgressBar } from '../../design/components/ProgressBar';
import { CocoPet } from '../../design/components/CocoPet';
import { OnboardingShell } from './OnboardingShell';
import { useOnboardingStore, type RiskAnswerKey, type RiskAnswerValue } from './useOnboardingStore';
import { synthesizeSpeech, stopSpeech } from '../../voice/elevenlabs';
import { computeOnboardingRiskScore } from '../../screens/onboarding/riskScoring';

// ─── Question data ────────────────────────────────────────────────────────────

interface AnswerOption {
  value: RiskAnswerValue;
  icon: string;
  label: string;
  sublabel: string;
  voiceLabel: string;
  /** Risk weight 0–3 (higher = more risk tolerance) */
  weight: number;
}

interface Question {
  key: RiskAnswerKey;
  scenario: string;
  question: string;
  voiceScenario: string;
  answers: AnswerOption[];
}

const QUESTIONS: Question[] = [
  {
    key: 'q1',
    scenario: "You saved $100 in SafeHaven. One morning you open the app and see it's now worth $90.",
    question: "What do you do?",
    voiceScenario: "Here's the scenario: You saved 100 dollars in SafeHaven. One morning you open the app and see it's now worth 90 dollars. What do you do?",
    answers: [
      {
        value: 'a',
        icon: '😰',
        label: 'Pull it all out',
        sublabel: 'I need to protect what I have.',
        voiceLabel: 'Pull it all out. I need to protect what I have.',
        weight: 0,
      },
      {
        value: 'b',
        icon: '⏳',
        label: 'Wait and see',
        sublabel: 'I'll leave it and check back later.',
        voiceLabel: 'Wait and see. I\'ll leave it and check back later.',
        weight: 1,
      },
      {
        value: 'c',
        icon: '💪',
        label: 'Add more',
        sublabel: 'Lower price means a better deal for me!',
        voiceLabel: 'Add more. Lower price means a better deal for me!',
        weight: 2,
      },
    ],
  },
  {
    key: 'q2',
    scenario: "Imagine you found an extra $200 today — a bonus at work or a gift.",
    question: "What feels right to do with it?",
    voiceScenario: "Imagine you found an extra 200 dollars today — a bonus at work or a gift. What feels right to do with it?",
    answers: [
      {
        value: 'a',
        icon: '🛡️',
        label: 'Save it for emergencies',
        sublabel: "My safety net needs to come first.",
        voiceLabel: 'Save it for emergencies. My safety net needs to come first.',
        weight: 0,
      },
      {
        value: 'b',
        icon: '🛍️',
        label: 'Spend some, save some',
        sublabel: "I deserve a treat — but I'll save half.",
        voiceLabel: 'Spend some, save some. I deserve a treat but I\'ll save half.',
        weight: 1,
      },
      {
        value: 'c',
        icon: '🌱',
        label: 'Invest it to grow',
        sublabel: "I'd rather put it to work right away.",
        voiceLabel: 'Invest it to grow. I\'d rather put it to work right away.',
        weight: 2,
      },
    ],
  },
  {
    key: 'q3',
    scenario: "Think about the money you're setting aside in SafeHaven.",
    question: "When might you need to use it?",
    voiceScenario: "Think about the money you're setting aside in SafeHaven. When might you need to use it?",
    answers: [
      {
        value: 'a',
        icon: '⚡',
        label: 'Within 3 months',
        sublabel: 'I may need it soon.',
        voiceLabel: 'Within 3 months. I may need it soon.',
        weight: 0,
      },
      {
        value: 'b',
        icon: '📅',
        label: '3 months to 1 year',
        sublabel: "I'm planning for later this year.",
        voiceLabel: '3 months to 1 year. I\'m planning for later this year.',
        weight: 1,
      },
      {
        value: 'c',
        icon: '🗓️',
        label: '1–3 years',
        sublabel: "I can leave it for a while.",
        voiceLabel: '1 to 3 years. I can leave it for a while.',
        weight: 2,
      },
    ],
  },
  {
    key: 'q4',
    scenario: "An emergency fund covers 3 months of your living costs if something goes wrong.",
    question: "Do you have one?",
    voiceScenario: "An emergency fund covers 3 months of your living costs if something goes wrong. Do you have one?",
    answers: [
      {
        value: 'a',
        icon: '✅',
        label: 'Yes — 3 months or more',
        sublabel: "I'm covered.",
        voiceLabel: 'Yes, 3 months or more. I\'m covered.',
        weight: 2,
      },
      {
        value: 'b',
        icon: '🔄',
        label: 'Working on it',
        sublabel: "I have some savings but not a full fund yet.",
        voiceLabel: 'Working on it. I have some savings but not a full fund yet.',
        weight: 1,
      },
      {
        value: 'c',
        icon: '❌',
        label: 'Not yet',
        sublabel: "Building one is my main goal.",
        voiceLabel: 'Not yet. Building one is my main goal.',
        weight: 0,
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export interface RiskProfilingScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function RiskProfilingScreen({
  onNext,
  onBack,
}: RiskProfilingScreenProps): React.ReactElement {
  const { colors, fonts, spacing, reducedMotion } = useTheme();
  const { riskAnswers, setRiskAnswer, setRiskScore, voiceFirstMode, locale } = useOnboardingStore();

  const [currentQ, setCurrentQ] = useState(0);
  const [cocoMood, setCocoMood] = useState<'idle' | 'happy' | 'thinking'>('thinking');
  const [questionKey, setQuestionKey] = useState(0); // Key to remount for animation

  const question = QUESTIONS[currentQ]!;
  const selectedAnswer = riskAnswers[question.key];
  const progress = (currentQ / QUESTIONS.length) * 100;

  // Auto-narrate question in voice-first mode
  useEffect(() => {
    if (voiceFirstMode) {
      const speak = async () => {
        await stopSpeech();
        await synthesizeSpeech(
          `${question.voiceScenario} Choose one of the following options: ${question.answers.map((a, i) => `Option ${i + 1}: ${a.voiceLabel}`).join('. ')}`,
          { locale },
        );
      };
      speak();
    }

    setCocoMood('thinking');
    AccessibilityInfo.announceForAccessibility(
      `Question ${currentQ + 1} of ${QUESTIONS.length}: ${question.scenario} ${question.question}`,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ]);

  const handleAnswer = useCallback(async (answer: AnswerOption) => {
    setRiskAnswer(question.key, answer.value);
    setCocoMood('happy');

    if (voiceFirstMode) {
      await stopSpeech();
      await synthesizeSpeech(`Great! You chose: ${answer.voiceLabel}`, { locale });
    }

    // Brief pause then advance
    setTimeout(() => {
      setCocoMood('thinking');
    }, 1200);
  }, [question.key, setRiskAnswer, voiceFirstMode, locale]);

  const handleNext = useCallback(async () => {
    if (currentQ < QUESTIONS.length - 1) {
      setQuestionKey((k) => k + 1);
      setCurrentQ((q) => q + 1);
    } else {
      // Compute final score
      const score = computeOnboardingRiskScore(riskAnswers);
      setRiskScore(score);

      if (voiceFirstMode) {
        await synthesizeSpeech(
          `Great work! Based on your answers, your risk score is ${score} out of 5. We'll find the safest strategies that match your goals.`,
          { locale },
        );
      }

      onNext();
    }
  }, [currentQ, riskAnswers, setRiskScore, voiceFirstMode, locale, onNext]);

  return (
    <OnboardingShell
      step={5}
      screenTitle={`Question ${currentQ + 1} of ${QUESTIONS.length}`}
      onBack={currentQ === 0 ? onBack : () => { setCurrentQ((q) => Math.max(0, q - 1)); setQuestionKey((k) => k + 1); }}
      cocoVariant={cocoMood}
      showVoiceReplay={voiceFirstMode}
      onVoiceReplay={async () => {
        await stopSpeech();
        await synthesizeSpeech(question.voiceScenario + ' ' + question.question, { locale });
      }}
      footer={
        <Button
          label={currentQ < QUESTIONS.length - 1 ? 'Next question' : 'See my results'}
          variant={selectedAnswer ? 'primary' : 'secondary'}
          size="lg"
          fullWidth
          disabled={!selectedAnswer}
          onPress={handleNext}
          accessibilityLabel={
            selectedAnswer
              ? currentQ < QUESTIONS.length - 1 ? 'Next question' : 'See my risk results'
              : 'Please choose an answer first'
          }
        />
      }
    >
      {/* Progress */}
      <View style={{ marginBottom: spacing[4] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[1] }}>
          <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, fontWeight: '600' }}>
            Question {currentQ + 1} of {QUESTIONS.length}
          </Text>
          <Text style={{ color: colors.primary, fontSize: fonts.sizes.sm, fontWeight: '700' }}>
            {Math.round(progress)}% done
          </Text>
        </View>
        <ProgressBar
          value={currentQ + (selectedAnswer ? 1 : 0)}
          max={QUESTIONS.length}
          variant="lesson"
          height={6}
          accessibilityLabel={`Quiz progress: question ${currentQ + 1} of ${QUESTIONS.length}`}
        />
      </View>

      {/* Coco */}
      <View style={styles.cocoRow}>
        <CocoPet variant={cocoMood} size={72} animated={!reducedMotion} />
      </View>

      {/* Scenario + question */}
      <Animated.View
        key={questionKey}
        entering={!reducedMotion ? FadeInRight.duration(260) : undefined}
      >
        {/* Scenario bubble */}
        <View
          style={[
            styles.scenarioBubble,
            {
              backgroundColor: colors.primaryLight,
              borderRadius: 16,
              borderBottomLeftRadius: 4,
              padding: spacing[4],
              marginBottom: spacing[4],
            },
          ]}
        >
          <Text
            style={{
              color: colors.primaryDark,
              fontSize: fonts.sizes.base,
              lineHeight: fonts.lineHeight(fonts.sizes.base, 'relaxed'),
              fontWeight: '500',
            }}
            allowFontScaling
          >
            {question.scenario}
          </Text>
        </View>

        {/* Question */}
        <Text
          accessible
          accessibilityRole="header"
          style={[
            styles.questionText,
            { color: colors.text, fontSize: fonts.sizes.lg, fontWeight: '800', marginBottom: spacing[4] },
          ]}
          allowFontScaling
        >
          {question.question}
        </Text>

        {/* Answer options */}
        <View
          accessibilityRole="radiogroup"
          accessible={false}
          style={styles.answers}
        >
          {question.answers.map((answer) => (
            <AnswerCard
              key={answer.value}
              answer={answer}
              isSelected={selectedAnswer === answer.value}
              onPress={() => handleAnswer(answer)}
              reducedMotion={reducedMotion}
            />
          ))}
        </View>
      </Animated.View>
    </OnboardingShell>
  );
}

// ─── Answer card ──────────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnswerCardProps {
  answer: AnswerOption;
  isSelected: boolean;
  onPress: () => void;
  reducedMotion: boolean;
}

function AnswerCard({ answer, isSelected, onPress, reducedMotion }: AnswerCardProps): React.ReactElement {
  const { colors, fonts, spacing, radius } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessible
      accessibilityRole="radio"
      accessibilityLabel={`${answer.label}. ${answer.sublabel}`}
      accessibilityHint={isSelected ? 'Currently selected' : 'Double-tap to select this answer'}
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      onPressIn={() => {
        if (!reducedMotion) scale.value = withSpring(0.97, { damping: 18, stiffness: 350 });
      }}
      onPressOut={() => {
        if (!reducedMotion) scale.value = withSpring(1, { damping: 14, stiffness: 300 });
      }}
      style={[
        styles.answerCard,
        {
          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: isSelected ? 2 : 1,
          borderRadius: radius.lg,
          padding: spacing[4],
          marginBottom: spacing[2],
        },
        animStyle,
      ]}
    >
      <Text style={styles.answerIcon} accessible={false}>{answer.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: isSelected ? colors.primaryDark : colors.text,
            fontSize: fonts.sizes.base,
            fontWeight: '700',
          }}
          allowFontScaling
        >
          {answer.label}
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: fonts.sizes.sm,
            marginTop: 2,
          }}
          allowFontScaling
        >
          {answer.sublabel}
        </Text>
      </View>
      {isSelected && (
        <View
          style={[
            styles.checkCircle,
            { backgroundColor: colors.primary, borderRadius: 12 },
          ]}
          accessible={false}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>✓</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  cocoRow: { alignItems: 'center', marginBottom: 12 },
  scenarioBubble: {},
  questionText: { letterSpacing: -0.2 },
  answers: {},
  answerCard: { flexDirection: 'row', alignItems: 'center' },
  answerIcon: { fontSize: 28, marginRight: 12, width: 38, textAlign: 'center' },
  checkCircle: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
