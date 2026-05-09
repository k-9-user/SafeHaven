import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Wallet,
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
import WalletSelector from '../components/WalletSelector';
import MarketMonitor from '../components/MarketMonitor';
import SolanaTradingDesk from '../components/SolanaTradingDesk';
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

export default function EducationalHub() {
  const location = useLocation();
  const { address: solanaAddress, connectSolana, disconnect: disconnectSolana } = useSolana();

  const [activeTab, setActiveTab] = useState('education');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletLabel, setWalletLabel] = useState('No wallet connected');
  const [solanaBalance, setSolanaBalance] = useState(12.5);
  const [guardMessage, setGuardMessage] = useState('AI guard armed');
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [quizResult, setQuizResult] = useState(null);
  const [dailyChallengeIndex, setDailyChallengeIndex] = useState(0);
  const [, setProgressTick] = useState(0);

  useEffect(() => {
    if (solanaAddress && solanaAddress !== walletAddress) {
      setWalletAddress(solanaAddress);
      setWalletLabel('Phantom');
      setSelectedWallet('phantom');
      setGuardMessage('Live Phantom wallet connected');
    }
  }, [solanaAddress, walletAddress]);

  useEffect(() => {
    const section = location.hash.replace('#', '');
    if (section === 'education' || section === 'wallet' || section === 'platform') {
      setActiveTab(section);
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
  const isDemoWallet = Boolean(walletAddress && walletAddress.startsWith('DEMO-'));

  const playfulModules = [
    {
      title: 'Mission USDC',
      description: 'Protege une partie de ton capital avec une logique simple et visuelle.',
      badge: '5 min',
      icon: ShieldCheck,
    },
    {
      title: 'Bonus Budget',
      description: 'Choisis quoi couper pour liberer plus de marge de securite.',
      badge: 'Quiz',
      icon: Trophy,
    },
    {
      title: 'Roulette Risque',
      description: 'Decide quand garder, epargner ou convertir selon le scenario.',
      badge: 'Game',
      icon: Dice6,
    },
    {
      title: 'Streak semaine',
      description: 'Enchaine de petites victoires pour debloquer des badges SafeHaven.',
      badge: 'Streak',
      icon: Flame,
    },
  ];

  const dailyChallenges = [
    'Explique en une phrase ce que veut dire emergency fund.',
    'Repere la meilleure habitude pour proteger 20$ de revenus.',
    'Choisis une action simple pour reduire ton risque aujourd hui.',
    'Dis quand il faut garder du cash au lieu de chercher du rendement.',
  ];

  const pathSteps = [
    { title: 'Start here', label: 'Budget basics', done: getCourseProgress('finance-basics').completed > 0 },
    { title: 'Build safety', label: 'Emergency fund', done: getCourseProgress('finance-basics').completed >= 2 },
    { title: 'Protect capital', label: 'Stablecoin shield', done: getCourseProgress('market-protection').completed > 0 },
    { title: 'Wallet ready', label: 'Sign on chain', done: Boolean(walletAddress) },
  ];

  const resources = [
    {
      title: 'AI Asset Guard',
      description:
        'The platform watches the market and can convert assets into USDC on Solana when downside risk rises.',
      tips: ['Monitors market volatility', 'Protects capital automatically', 'Keeps funds in USDC when risk is high'],
    },
    {
      title: 'Solana Wallet Layer',
      description:
        'Connect Phantom or use the demo mode to unlock the trading platform behind the education hub.',
      tips: ['Fast settlement', 'Low transaction fees', 'Secure wallet signing'],
    },
  ];

  const handleWalletConnect = async (walletId, options = {}) => {
    setSelectedWallet(walletId);

    if (options.demo || walletId !== 'phantom') {
      const walletName = walletId === 'phantom' ? 'Phantom' : walletId;
      const suffix = Math.random().toString(16).slice(2, 10).toUpperCase();
      setWalletAddress(`DEMO-${walletName}-${suffix}`);
      setWalletLabel(`${walletName} (demo)`);
      setGuardMessage('Demo wallet connected');
      return;
    }

    const realAddress = await connectSolana();
    setWalletAddress(realAddress);
    setWalletLabel('Phantom');
    setGuardMessage('Live Phantom wallet connected');
  };

  const handleDisconnect = () => {
    disconnectSolana();
    setSelectedWallet(null);
    setWalletAddress(null);
    setWalletLabel('No wallet connected');
    setGuardMessage('AI guard armed');
  };

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

    setGuardMessage(`Protected in USDC: ${result.estimatedOutputUsdc.toFixed(2)} USDC`);
    setSolanaBalance((previous) => Math.max(0, previous - Number(solAmount || 0)));
    return result;
  };

  const handleTradeComplete = (result) => {
    if (!result?.estimatedInputSol) return;
    setSolanaBalance((previous) => Math.max(0, previous - result.estimatedInputSol));
    setGuardMessage('Trade completed and protected on Solana');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-cyan-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge variant="outline" className="w-fit border-white/20 bg-white/10 text-white">
                SafeHaven Learning Mode
              </Badge>
              <h1 className="text-4xl font-black md:text-6xl">Learn, then protect your capital with a guided path.</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                The education hub now follows a mastery path: one visible course room, real lesson content, quizzes,
                and a gamified track that feels closer to a learning game than a static library.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm md:min-w-72">
              <div className="flex items-center gap-2 text-cyan-200"><Sparkles className="h-4 w-4" /> Guided progress</div>
              <div className="flex items-center gap-2 text-cyan-200"><ShieldCheck className="h-4 w-4" /> Real lesson content</div>
              <div className="flex items-center gap-2 text-cyan-200"><BookOpen className="h-4 w-4" /> Game-like learning path</div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/95 p-1 text-white">
            <TabsTrigger value="education" className="gap-2 data-[state=active]:bg-cyan-400 data-[state=active]:text-slate-950">
              <BookOpen className="h-4 w-4" /> Education
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2 data-[state=active]:bg-cyan-400 data-[state=active]:text-slate-950">
              <Wallet className="h-4 w-4" /> Wallet
            </TabsTrigger>
            <TabsTrigger value="platform" className="gap-2 data-[state=active]:bg-cyan-400 data-[state=active]:text-slate-950">
              <Lock className="h-4 w-4" /> Platform
            </TabsTrigger>
          </TabsList>

          <TabsContent value="education" className="mt-6 space-y-6">
            <VoiceFinanceCoach />

            <Card className="border-cyan-200 bg-white shadow-lg">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-slate-900">Progression style GitMastery</CardTitle>
                    <CardDescription>
                      Un parcours clair, des jalons visibles et un vrai contenu pédagogique derriere chaque etape.
                    </CardDescription>
                  </div>
                  <Badge className="w-fit rounded-md bg-cyan-600 text-white hover:bg-cyan-600">
                    Progression cours: {lessonProgressPercent}%
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
                      <p className="font-semibold">Defi du moment</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{dailyChallenges[dailyChallengeIndex]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {resources.map((resource) => (
                <Card key={resource.title} className="border-slate-200 bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-slate-900">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {resource.tips.map((tip) => (
                        <li key={tip} className="flex items-center gap-2">
                          <span className="text-cyan-600">✓</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            {!walletAddress ? (
              <WalletSelector
                selectedWallet={selectedWallet}
                onWalletSelect={setSelectedWallet}
                onConnect={handleWalletConnect}
              />
            ) : (
              <div className="space-y-6">
                <Card className="border-emerald-200 bg-emerald-50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-emerald-900">Wallet connected</CardTitle>
                    <CardDescription>
                      {isDemoWallet
                        ? 'Demo mode is active, but the platform remains fully usable.'
                        : 'The live trading platform is unlocked.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Wallet</p>
                      <p className="mt-2 break-all font-mono text-sm text-slate-900">{walletAddress}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Connected wallet</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{walletLabel}</p>
                    </div>
                    <Button onClick={handleDisconnect} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                      Disconnect wallet
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Mode</CardTitle>
                    <CardDescription>Keep demo as a fallback while still enabling real Phantom signing.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      Current mode: <span className="font-semibold text-slate-950">{isDemoWallet ? 'Demo' : 'Live'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="platform" className="mt-6 space-y-6">
            {!walletAddress ? (
              <Card className="border-slate-200 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900">Trading platform locked</CardTitle>
                  <CardDescription>Connect a Solana wallet to unlock AI protection, trading, and USDC auto-secure.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="bg-cyan-500 text-slate-950 hover:bg-cyan-400" onClick={() => setActiveTab('wallet')}>
                    Go to Wallet tab
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                <MarketMonitor
                  walletAddress={walletAddress}
                  solanaBalance={solanaBalance}
                  onAutoSecure={handleAutoSecure}
                />

                <div className="space-y-6">
                  <SolanaTradingDesk
                    walletAddress={walletAddress}
                    solanaBalance={solanaBalance}
                    demoMode={isDemoWallet}
                    onTradeComplete={handleTradeComplete}
                    onTradeStatus={setGuardMessage}
                  />

                  <Card className="border-slate-200 bg-slate-950 text-white shadow-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <ShieldCheck className="h-5 w-5 text-cyan-300" /> AI Protection Layer
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        The guard watches the market and converts assets to USDC on Solana when risk increases.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Guard status</p>
                        <p className="mt-2 font-semibold text-cyan-300">{guardMessage}</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                        <p className="mb-2 font-semibold text-white">What the AI does</p>
                        <ul className="space-y-2">
                          <li>• Watches market movements around the clock</li>
                          <li>• Detects volatility and downside pressure</li>
                          <li>• Secures SOL into USDC on Solana when needed</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
