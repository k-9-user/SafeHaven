import { Suspense, lazy, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Lock,
  ShieldCheck,
  Sparkles,
  Trophy,
  Dice6,
  Flame,
  Star,
  CheckCircle2,
  Circle,
  ChevronRight,
  PlayCircle,
  Medal,
} from 'lucide-react';
import MarketMonitor from '../components/MarketMonitor';
import VoiceFinanceCoach from '../components/VoiceFinanceCoach';
import COURSES from '@/data/coursesData';
import {
  isLessonRead,
  markLessonRead,
  getCourseProgress,
  setLessonScore,
  getLessonScore,
  getCourseScoreSummary,
} from '@/lib/courseProgress';
import { useSolana } from '../hooks/useSolana';
import { executeJupiterSwap } from '@/lib/jupiterSwap';

const LiFiWalletWidget = lazy(() => import('../components/LiFiWalletWidget'));

function LiFiWalletWidgetFallback() {
  return (
    <Card className="border-blue-200 bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-blue-950">LI.FI Wallet Connect</CardTitle>
        <CardDescription>Loading wallet connection tools...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[360px] animate-pulse rounded-lg bg-blue-50" />
      </CardContent>
    </Card>
  );
}

export default function EducationalHub() {
  const location = useLocation();
  const { address: solanaAddress } = useSolana();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'education';
    const savedTab = window.sessionStorage.getItem('safehaven-active-tab');
    return savedTab === 'platform' ? 'platform' : 'education';
  });
  const [walletAddress, setWalletAddress] = useState(null);
  const [solanaBalance, setSolanaBalance] = useState(12.5);
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [quizResult, setQuizResult] = useState(null);
  const [dailyChallengeIndex, setDailyChallengeIndex] = useState(0);
  const [, setProgressTick] = useState(0);

  useEffect(() => {
    if (solanaAddress && solanaAddress !== walletAddress) {
      setWalletAddress(solanaAddress);
    }
  }, [solanaAddress, walletAddress]);

  useEffect(() => {
    const section = location.hash.replace('#', '');
    if (section === 'education' || section === 'platform') {
      setActiveTab(section);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('safehaven-active-tab', section);
      }
      return;
    }

    if (section === 'wallet') {
      setActiveTab('platform');
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('safehaven-active-tab', 'platform');
      }
    }
  }, [location.hash]);

  useEffect(() => {
    setSelectedLessonIndex(0);
    setQuizResult(null);
  }, [selectedCourseIndex]);

  const currentCourse = COURSES[selectedCourseIndex] || COURSES[0];
  const currentLesson = currentCourse.lessons[selectedLessonIndex] || currentCourse.lessons[0];

  const totalLessons = COURSES.reduce((sum, course) => sum + course.lessons.length, 0);
  const completedLessons = COURSES.reduce((sum, course) => sum + getCourseProgress(course.id).completed, 0);
  const lessonProgressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const currentCourseProgress = getCourseProgress(currentCourse.id);
  const currentScore = getLessonScore(currentCourse.id, currentLesson.id);
  const currentScoreSummary = getCourseScoreSummary(currentCourse.id);
  const currentLessonRead = isLessonRead(currentCourse.id, currentLesson.id);
  const platformWalletAddress = walletAddress || 'DEMO-SAFEHAVEN-PLATFORM';

  const playfulModules = [
    {
      title: 'Mission USDC',
      description: 'Protect part of your capital with a simple visual rule.',
      badge: '5 min',
      icon: ShieldCheck,
    },
    {
      title: 'Budget Boost',
      description: 'Choose what to reduce so you can build a stronger safety margin.',
      badge: 'Quiz',
      icon: Trophy,
    },
    {
      title: 'Risk Wheel',
      description: 'Decide when to hold cash, save, or convert based on the scenario.',
      badge: 'Game',
      icon: Dice6,
    },
    {
      title: 'Weekly Streak',
      description: 'Stack small wins to unlock SafeHaven badges.',
      badge: 'Streak',
      icon: Flame,
    },
  ];

  const dailyChallenges = [
    'Explain emergency fund in one sentence.',
    'Spot the best habit for protecting $20 of income.',
    'Choose one action that lowers your risk today.',
    'Say when cash is safer than chasing yield.',
  ];

  const pathSteps = [
    { title: 'Start here', label: 'Budget basics', done: getCourseProgress('finance-basics').completed > 0 },
    { title: 'Build safety', label: 'Emergency fund', done: getCourseProgress('finance-basics').completed >= 2 },
    { title: 'Protect capital', label: 'Stablecoin shield', done: getCourseProgress('market-protection').completed > 0 },
    { title: 'Wallet ready', label: 'Sign on chain', done: Boolean(walletAddress) },
  ];

  const handleAutoSecure = async ({ walletAddress: currentWallet, solAmount, secureReason }) => {
    if (!currentWallet) {
      throw new Error('Connect a wallet first');
    }

    if (String(currentWallet).startsWith('DEMO-')) {
      const demoSignature = `demo-${Date.now().toString(36)}`;
      setGuardMessage(`Demo secure complete: ${secureReason}`);
      setSolanaBalance((previous) => Math.max(0, previous - Number(solAmount || 0)));
      return {
        signature: demoSignature,
        estimatedInputSol: Number(solAmount || 0),
        estimatedOutputUsdc: Number(solAmount || 0) * 141.25,
        priceImpactPct: 0.05,
      };
    }

    const result = await executeJupiterSwap({
      walletAddress: currentWallet,
      amountSol: solAmount,
      slippageBps: 50,
    });

    setSolanaBalance((previous) => Math.max(0, previous - Number(solAmount || 0)));
    return result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-cyan-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-lg bg-gradient-to-r from-slate-950 via-blue-900 to-cyan-900 p-6 text-white shadow-2xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge variant="outline" className="w-fit border-white/20 bg-white/10 text-white">
                Mobile-first financial inclusion MVP
              </Badge>
              <h1 className="text-4xl font-black md:text-6xl">SafeHaven</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                A voice-accessible AI companion that helps beginners protect money, learn finance basics, and preview
                safer Solana DeFi actions based on risk profile, amount, and goals.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm md:min-w-72">
              <div className="flex items-center gap-2 text-cyan-200"><Sparkles className="h-4 w-4" /> ElevenLabs-ready voice</div>
              <div className="flex items-center gap-2 text-cyan-200"><ShieldCheck className="h-4 w-4" /> Solana wallet approval</div>
              <div className="flex items-center gap-2 text-cyan-200"><BookOpen className="h-4 w-4" /> LI.FI route preview</div>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem('safehaven-active-tab', value);
            }
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/95 p-1 text-white">
            <TabsTrigger value="education" className="min-w-0 gap-1 px-1 text-[11px] sm:gap-2 sm:text-sm data-[state=active]:bg-cyan-400 data-[state=active]:text-slate-950">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Education
            </TabsTrigger>
            <TabsTrigger value="platform" className="min-w-0 gap-1 px-1 text-[11px] sm:gap-2 sm:text-sm data-[state=active]:bg-cyan-400 data-[state=active]:text-slate-950">
              <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Platform
            </TabsTrigger>
          </TabsList>

          <TabsContent value="education" className="mt-6 space-y-6">
            <VoiceFinanceCoach />

            <Card className="border-cyan-200 bg-white shadow-lg">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-slate-900">Learning progression</CardTitle>
                    <CardDescription>
                      Clear milestones, real lessons, quizzes, and accessible beginner finance missions.
                    </CardDescription>
                  </div>
                  <Badge className="w-fit rounded-md bg-cyan-600 text-white hover:bg-cyan-600">
                    Course progress: {lessonProgressPercent}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 xl:grid-cols-[0.9fr_1.5fr_1fr]">
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <PlayCircle className="h-5 w-5 text-cyan-600" />
                    <p className="font-semibold">Learning path</p>
                  </div>
                  <div className="space-y-3">
                    {pathSteps.map((step, index) => (
                      <button
                        key={step.label}
                        type="button"
                        onClick={() => {
                          setSelectedCourseIndex(index % COURSES.length);
                          setSelectedLessonIndex(0);
                          setQuizResult(null);
                        }}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
                          selectedCourseIndex === index % COURSES.length
                            ? 'border-cyan-400 bg-cyan-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {step.done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300" />
                        )}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{step.title}</p>
                          <p className="font-medium text-slate-900">{step.label}</p>
                        </div>
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Course XP</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{completedLessons * 50 + currentScoreSummary.avgScore}</p>
                    <p className="mt-1 text-sm text-slate-600">Complete lessons and quizzes to grow your mastery score.</p>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Lesson room</p>
                      <h3 className="mt-1 text-2xl font-black text-slate-950">{currentLesson.title}</h3>
                    </div>
                    <Badge className="rounded-md bg-slate-900 text-white">{currentScore ?? 0}% saved</Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Course</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{currentCourse.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{currentCourse.description}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{currentLessonRead ? 'Lesson completed' : 'In progress'}</p>
                      <p className="mt-1 text-sm text-slate-600">Quiz average: {currentScoreSummary.avgScore}%</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Medal className="h-4 w-4 text-cyan-600" />
                      <p className="font-semibold">Real lesson content</p>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{currentLesson.content}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="bg-slate-900 text-white hover:bg-slate-800"
                      onClick={() => {
                        markLessonRead(currentCourse.id, currentLesson.id, !currentLessonRead);
                        setProgressTick((value) => value + 1);
                      }}
                    >
                      {currentLessonRead ? 'Mark unread' : 'Mark read'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setQuizResult(null)}
                    >
                      Reset quiz
                    </Button>
                  </div>

                  {currentLesson.quiz && (
                    <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Quick quiz</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{currentLesson.quiz.question}</p>

                      <div className="mt-3 space-y-2">
                        {currentLesson.quiz.options.map((option, optionIndex) => (
                          <Button
                            key={option}
                            variant="outline"
                            className="w-full justify-start border-cyan-200 bg-white text-left"
                            onClick={() => {
                              const isCorrect = optionIndex === currentLesson.quiz.correctIndex;
                              const score = isCorrect ? 100 : 0;
                              setLessonScore(currentCourse.id, currentLesson.id, score);
                              setQuizResult(isCorrect ? 'Correct answer!' : 'Wrong answer, try again.');
                              setProgressTick((value) => value + 1);
                            }}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>

                      <div className="mt-3 text-sm text-slate-700">
                        <p>{quizResult || 'Choose an answer to get your score.'}</p>
                        <p className="mt-1">Saved score: {currentScore ?? '-'}%</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Trophy className="h-5 w-5 text-cyan-600" />
                    <p className="font-semibold">Game layer</p>
                  </div>
                  <div className="grid gap-3">
                    {playfulModules.map((module, index) => {
                      const Icon = module.icon;
                      return (
                        <button
                          key={module.title}
                          type="button"
                          onClick={() => setDailyChallengeIndex(index)}
                          className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-1 hover:shadow-md ${
                            dailyChallengeIndex === index
                              ? 'border-cyan-400 bg-cyan-50'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="rounded-2xl bg-slate-900 p-3 text-white">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900">{module.title}</h3>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{module.badge}</p>
                              </div>
                            </div>
                            <Star className="h-5 w-5 text-cyan-500" />
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">{module.description}</p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Flame className="h-4 w-4 text-cyan-600" />
                      <p className="font-semibold">Current challenge</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{dailyChallenges[dailyChallengeIndex]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="platform" className="mt-6 space-y-6">
            <div className="space-y-6">
              <MarketMonitor
                walletAddress={platformWalletAddress}
                solanaBalance={solanaBalance}
                onAutoSecure={handleAutoSecure}
              />

              <Suspense fallback={<LiFiWalletWidgetFallback />}>
                <LiFiWalletWidget />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
