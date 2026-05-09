import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Wallet, Lock, ShieldCheck, Sparkles } from 'lucide-react';
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
  const { address: solanaAddress, connectSolana, disconnect: disconnectSolana } = useSolana();

  const [activeTab, setActiveTab] = useState('education');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletLabel, setWalletLabel] = useState('No wallet connected');
  const [solanaBalance, setSolanaBalance] = useState(12.5);
  const [guardMessage, setGuardMessage] = useState('AI guard armed');

  useEffect(() => {
    if (solanaAddress && solanaAddress !== walletAddress) {
      setWalletAddress(solanaAddress);
      setWalletLabel('Phantom');
      setSelectedWallet('phantom');
      setGuardMessage('Live Phantom wallet connected');
    }
  }, [solanaAddress, walletAddress]);

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

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [quizResult, setQuizResult] = useState(null);
  const [, setProgressTick] = useState(0);

  const isDemoWallet = Boolean(walletAddress && walletAddress.startsWith('DEMO-'));
  const totalLessons = COURSES.reduce((sum, course) => sum + course.lessons.length, 0);
  const completedLessons = COURSES.reduce(
    (sum, course) => sum + getCourseProgress(course.id).completed,
    0,
  );
  const lessonProgressPercent = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  const novicePath = [
    {
      id: 'start-learning',
      title: 'Demarrer les bases',
      description: 'Ouvre un module et lis au moins 1 lecon sur budget, risque et USDC.',
      done: completedLessons > 0,
      cta: 'Choisir un cours',
      action: () => setActiveTab('education'),
    },
    {
      id: 'connect-wallet',
      title: 'Connecter ton wallet Solana',
      description: 'Utilise Phantom en live ou active le mode demo pour simuler ton onboarding.',
      done: Boolean(walletAddress),
      cta: 'Aller au wallet',
      action: () => setActiveTab('wallet'),
    },
    {
      id: 'ask-coach',
      title: 'Poser une question au coach IA',
      description: 'Demande une strategie simple (allocation, protection, DCA) en texte ou vocal.',
      done: false,
      cta: 'Utiliser le coach vocal',
      action: () => setActiveTab('education'),
    },
    {
      id: 'secure-trading',
      title: 'Activer la protection de marche',
      description: 'Passe sur Platform pour trader SOL et securiser en USDC avec le guard.',
      done: Boolean(walletAddress),
      cta: 'Ouvrir la platform',
      action: () => setActiveTab('platform'),
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
                SafeHaven Trading Core
              </Badge>
              <h1 className="text-4xl font-black md:text-6xl">Learn, connect wallet, then trade with AI protection.</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                The platform keeps education front and center, then unlocks a secure trading layer behind it. The AI guard watches the market and can convert assets to USDC on Solana when downside risk increases.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm md:min-w-72">
              <div className="flex items-center gap-2 text-cyan-200"><Sparkles className="h-4 w-4" /> AI market guard</div>
              <div className="flex items-center gap-2 text-cyan-200"><ShieldCheck className="h-4 w-4" /> Jupiter SOL → USDC</div>
              <div className="flex items-center gap-2 text-cyan-200"><Wallet className="h-4 w-4" /> Phantom or demo wallet</div>
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
            <Card className="border-cyan-200 bg-white shadow-lg">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-slate-900">Parcours novice guide</CardTitle>
                    <CardDescription>
                      Suis ces etapes dans l ordre pour apprendre, connecter ton wallet, puis proteger ton capital.
                    </CardDescription>
                  </div>
                  <Badge className="w-fit rounded-md bg-cyan-600 text-white hover:bg-cyan-600">
                    Progression cours: {lessonProgressPercent}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {novicePath.map((step, index) => (
                  <div key={step.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Etape {index + 1}
                        </p>
                        <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                        <p className="text-sm text-slate-600">{step.description}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={step.done ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-300 bg-amber-50 text-amber-700'}
                      >
                        {step.done ? 'Done' : 'A faire'}
                      </Badge>
                    </div>
                    <Button
                      className="mt-4 w-full bg-slate-900 text-white hover:bg-slate-800"
                      onClick={step.action}
                    >
                      {step.cta}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <VoiceFinanceCoach />

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {COURSES.map((course) => {
                const progress = getCourseProgress(course.id);
                const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
                const scoreSummary = getCourseScoreSummary(course.id);
                return (
                  <Card key={course.id} className="border-slate-200 bg-white shadow-lg cursor-pointer" onClick={() => { setSelectedCourse(course); setSelectedLessonIndex(0); setQuizResult(null); }}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                          <span className="font-bold text-lg">{course.title[0]}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-900">{course.title}</CardTitle>
                          <CardDescription>{course.description}</CardDescription>
                        </div>
                        <div className="ml-auto text-sm text-slate-600">
                          <Badge variant="outline" className="rounded-md">{percent}%</Badge>
                          <div className="mt-2">
                            <Badge variant="outline" className="rounded-md">
                              Quiz avg: {scoreSummary.avgScore}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-slate-700">
                        {course.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-2">
                            <span className="text-cyan-600">•</span> {lesson.title}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

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

            {selectedCourse && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedCourse(null)} />
                <div className="relative max-w-4xl w-full">
                  <Card className="overflow-hidden">
                    <CardHeader className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{selectedCourse.title}</CardTitle>
                        <CardDescription>{selectedCourse.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => setSelectedCourse(null)}>Close</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-1 space-y-2">
                        <p className="text-sm font-semibold">Leçons</p>
                        <ul className="space-y-2">
                          {selectedCourse.lessons.map((lesson, idx) => (
                            <li key={lesson.id} className="flex items-center gap-2">
                              <Button variant={idx === selectedLessonIndex ? 'outline' : undefined} className="w-full text-left" onClick={() => setSelectedLessonIndex(idx)}>
                                {lesson.title}
                              </Button>
                              <div>
                                {isLessonRead(selectedCourse.id, lesson.id) ? (
                                  <Button onClick={() => { markLessonRead(selectedCourse.id, lesson.id, false); setSelectedLessonIndex(idx); setProgressTick((value) => value + 1); }} className="text-xs">Mark unread</Button>
                                ) : (
                                  <Button onClick={() => { markLessonRead(selectedCourse.id, lesson.id, true); setSelectedLessonIndex(idx); setProgressTick((value) => value + 1); }} className="text-xs">Mark read</Button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="md:col-span-2">
                        <div className="rounded-lg border p-4 bg-white">
                          <h3 className="font-semibold text-lg">{selectedCourse.lessons[selectedLessonIndex].title}</h3>
                          <p className="whitespace-pre-line mt-2 text-sm text-slate-700">{selectedCourse.lessons[selectedLessonIndex].content}</p>
                        </div>

                        {selectedCourse.lessons[selectedLessonIndex].quiz && (
                          <div className="rounded-lg border p-4 bg-slate-50 mt-4">
                            <p className="font-semibold text-slate-900">Quick Quiz</p>
                            <p className="mt-2 text-sm text-slate-700">{selectedCourse.lessons[selectedLessonIndex].quiz.question}</p>

                            <div className="mt-3 space-y-2">
                              {selectedCourse.lessons[selectedLessonIndex].quiz.options.map((option, optionIndex) => (
                                <Button
                                  key={option}
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    const isCorrect = optionIndex === selectedCourse.lessons[selectedLessonIndex].quiz.correctIndex;
                                    const score = isCorrect ? 100 : 0;
                                    setLessonScore(selectedCourse.id, selectedCourse.lessons[selectedLessonIndex].id, score);
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
                              <p className="mt-1">
                                Saved score: {getLessonScore(selectedCourse.id, selectedCourse.lessons[selectedLessonIndex].id) ?? '-'}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
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
