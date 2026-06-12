/**
 * SafeHaven Money — Course Data
 * 5 worlds × (4 lessons + 1 boss challenge)
 * All content is multilingual: { en, fr, es }
 */

const COURSES = [
  // ─────────────────────────────────────────────
  // WORLD 1 — 💰 Money Fundamentals
  // ─────────────────────────────────────────────
  {
    id: 'world1',
    title:       { en: '💰 Money Fundamentals', fr: '💰 Bases de l\'Argent', es: '💰 Fundamentos del Dinero' },
    description: { en: 'Build the foundation for smart money management.', fr: 'Construisez les bases d\'une gestion financière intelligente.', es: 'Construye las bases de una gestión inteligente del dinero.' },
    color: 'from-yellow-500 to-amber-600',
    lessons: [
      {
        id: 'w1l1',
        title: { en: 'What is Money?', fr: 'Qu\'est-ce que l\'Argent ?', es: '¿Qué es el Dinero?' },
        xp: 50,
        content: {
          en: `Money is a medium of exchange that allows people to trade goods and services without needing to barter directly. Throughout history, humans used shells, gold, and silver before paper currency became standard.\n\nToday, money serves three main functions: it is a medium of exchange (used to buy things), a unit of account (used to measure value), and a store of value (used to save purchasing power for later).\n\nModern money is mostly "fiat" — its value comes from government authority and social trust, not from a physical commodity. Central banks like the Federal Reserve or the European Central Bank control the money supply.\n\nDigital money is the next evolution: bank deposits, mobile payments, and cryptocurrencies all represent value electronically. Understanding what gives money its value — trust, scarcity, and utility — is the first step to managing it wisely.\n\nKey takeaway: money is a tool. How you use, save, and grow it determines your financial health. Start by understanding what it is before deciding what to do with it.`,
          fr: `L'argent est un moyen d'échange qui permet aux gens de commercer des biens et des services sans avoir à troquer directement. Tout au long de l'histoire, les humains ont utilisé des coquillages, de l'or et de l'argent avant que la monnaie papier ne devienne standard.\n\nAujourd'hui, l'argent remplit trois fonctions principales : il est un moyen d'échange (utilisé pour acheter des choses), une unité de compte (utilisée pour mesurer la valeur), et une réserve de valeur (utilisée pour conserver le pouvoir d'achat).\n\nLa monnaie moderne est surtout "fiduciaire" — sa valeur provient de l'autorité gouvernementale et de la confiance sociale, non d'une marchandise physique. Les banques centrales contrôlent la masse monétaire.\n\nLa monnaie numérique est la prochaine évolution : les dépôts bancaires, les paiements mobiles et les cryptomonnaies représentent tous de la valeur électroniquement. Comprendre ce qui donne de la valeur à l'argent — la confiance, la rareté et l'utilité — est la première étape pour le gérer intelligemment.`,
          es: `El dinero es un medio de intercambio que permite a las personas comerciar bienes y servicios sin necesidad de trocar directamente. A lo largo de la historia, los humanos usaron conchas, oro y plata antes de que el papel moneda se convirtiera en estándar.\n\nHoy en día, el dinero tiene tres funciones principales: es un medio de intercambio (usado para comprar cosas), una unidad de cuenta (usada para medir el valor), y un depósito de valor (usado para conservar poder adquisitivo).\n\nEl dinero moderno es principalmente "fiduciario" — su valor proviene de la autoridad del gobierno y la confianza social, no de una mercancía física. Los bancos centrales controlan la oferta monetaria.\n\nEl dinero digital es la siguiente evolución: los depósitos bancarios, los pagos móviles y las criptomonedas representan valor electrónicamente. Entender qué le da valor al dinero — confianza, escasez y utilidad — es el primer paso para administrarlo sabiamente.`,
        },
        quiz: {
          question: { en: 'Which of these is NOT a main function of money?', fr: 'Laquelle de ces options N\'est PAS une fonction principale de l\'argent ?', es: '¿Cuál de estas NO es una función principal del dinero?' },
          options: [
            { en: 'Medium of exchange', fr: 'Moyen d\'échange', es: 'Medio de intercambio' },
            { en: 'Store of value', fr: 'Réserve de valeur', es: 'Depósito de valor' },
            { en: 'Source of happiness', fr: 'Source de bonheur', es: 'Fuente de felicidad' },
          ],
          correctIndex: 2,
        },
      },
      {
        id: 'w1l2',
        title: { en: 'Income & Expenses', fr: 'Revenus & Dépenses', es: 'Ingresos y Gastos' },
        xp: 50,
        content: {
          en: `Understanding the difference between income and expenses is the cornerstone of personal finance. Income is money that flows into your life — salary, freelance work, investments, or side businesses. Expenses are everything you spend money on.\n\nThere are two types of expenses: fixed (rent, loan payments, subscriptions) which stay constant each month, and variable (food, entertainment, clothing) which change. Tracking both is essential.\n\nA simple method: write down every purchase for one month. Use categories like Housing, Food, Transport, Entertainment, and Savings. At the end of the month, add them up and compare to your income.\n\nIf your expenses are higher than your income, you have a deficit — debt will grow. If income exceeds expenses, you have a surplus — this is money you can save or invest.\n\nDigital tools like budgeting apps, spreadsheets, or even a notebook can help you track. The goal is awareness: you can't improve what you don't measure. Start tracking today and you'll find small leaks in your spending that, fixed, can fund your savings.`,
          fr: `Comprendre la différence entre revenus et dépenses est le fondement des finances personnelles. Les revenus sont l'argent qui entre dans votre vie — salaire, travail indépendant, investissements. Les dépenses sont tout ce que vous dépensez.\n\nIl y a deux types de dépenses : fixes (loyer, remboursements de prêts, abonnements) qui restent constantes chaque mois, et variables (alimentation, loisirs, vêtements) qui changent. Suivre les deux est essentiel.\n\nUne méthode simple : notez chaque achat pendant un mois. Utilisez des catégories comme Logement, Alimentation, Transport, Loisirs et Épargne. À la fin du mois, additionnez tout et comparez à vos revenus.\n\nSi vos dépenses dépassent vos revenus, vous avez un déficit — les dettes vont augmenter. Si les revenus dépassent les dépenses, vous avez un excédent — c'est de l'argent que vous pouvez épargner ou investir.`,
          es: `Entender la diferencia entre ingresos y gastos es la piedra angular de las finanzas personales. Los ingresos son el dinero que entra en tu vida — salario, trabajo freelance, inversiones. Los gastos son todo en lo que gastas dinero.\n\nHay dos tipos de gastos: fijos (alquiler, pagos de préstamos, suscripciones) que permanecen constantes cada mes, y variables (comida, entretenimiento, ropa) que cambian. Rastrear ambos es esencial.\n\nUn método simple: anota cada compra durante un mes. Usa categorías como Vivienda, Alimentación, Transporte, Entretenimiento y Ahorro. Al final del mes, súmalos y compáralos con tus ingresos.\n\nSi tus gastos son mayores que tus ingresos, tienes un déficit — la deuda crecerá. Si los ingresos superan los gastos, tienes un superávit — este es dinero que puedes ahorrar o invertir.`,
        },
        quiz: {
          question: { en: 'What is a "fixed expense"?', fr: 'Qu\'est-ce qu\'une "dépense fixe" ?', es: '¿Qué es un "gasto fijo"?' },
          options: [
            { en: 'A cost that stays the same every month (e.g. rent)', fr: 'Un coût qui reste le même chaque mois (ex: loyer)', es: 'Un costo que permanece igual cada mes (ej: alquiler)' },
            { en: 'A cost that varies like groceries', fr: 'Un coût variable comme les courses', es: 'Un costo variable como las compras' },
            { en: 'Any one-time purchase', fr: 'Tout achat unique', es: 'Cualquier compra única' },
          ],
          correctIndex: 0,
        },
      },
      {
        id: 'w1l3',
        title: { en: 'The 50/30/20 Rule', fr: 'La Règle 50/30/20', es: 'La Regla 50/30/20' },
        xp: 75,
        content: {
          en: `The 50/30/20 rule is one of the most popular budgeting frameworks in personal finance. It divides your after-tax income into three categories to ensure a balanced financial life.\n\n50% for Needs: These are essential expenses you cannot avoid — rent or mortgage, utilities, groceries, healthcare, minimum debt payments, and transportation to work. If this category exceeds 50%, look for ways to reduce housing or transport costs.\n\n30% for Wants: These are lifestyle expenses — dining out, streaming services, gym memberships, hobbies, and travel. They improve quality of life but aren't strictly necessary. This is the easiest category to cut when saving more.\n\n20% for Savings & Debt: This includes emergency fund contributions, retirement savings, and paying off debt beyond the minimum. This 20% is what builds your future financial security.\n\nAdapt the rule to your situation: if you live in an expensive city, your needs may be 60%. That's okay — reduce wants to 20% and keep savings at 20%. The key principle is intentional allocation: every dollar has a job.`,
          fr: `La règle 50/30/20 est l'un des cadres de budgétisation les plus populaires en finances personnelles. Elle divise votre revenu après impôts en trois catégories pour assurer une vie financière équilibrée.\n\n50% pour les Besoins : Ce sont les dépenses essentielles — loyer, services publics, épicerie, soins de santé, remboursements minimaux de dettes. Si cette catégorie dépasse 50%, cherchez à réduire les coûts de logement ou de transport.\n\n30% pour les Envies : Ce sont les dépenses de style de vie — restaurants, streaming, abonnements, loisirs. Elles améliorent la qualité de vie mais ne sont pas strictement nécessaires.\n\n20% pour l'Épargne et les Dettes : Cela inclut le fonds d'urgence, l'épargne-retraite et le remboursement des dettes au-delà du minimum. Ces 20% construisent votre sécurité financière future.`,
          es: `La regla 50/30/20 es uno de los marcos de presupuesto más populares en finanzas personales. Divide tu ingreso después de impuestos en tres categorías para asegurar una vida financiera equilibrada.\n\n50% para Necesidades: Son los gastos esenciales — alquiler, servicios, comida, salud, pagos mínimos de deudas. Si esta categoría supera el 50%, busca formas de reducir costos de vivienda o transporte.\n\n30% para Deseos: Son gastos de estilo de vida — restaurantes, streaming, gimnasio, pasatiempos. Mejoran la calidad de vida pero no son estrictamente necesarios.\n\n20% para Ahorro y Deudas: Incluye el fondo de emergencia, ahorros para la jubilación y pago de deudas más allá del mínimo. Este 20% construye tu seguridad financiera futura.`,
        },
        quiz: {
          question: { en: 'In the 50/30/20 rule, what does the 20% cover?', fr: 'Dans la règle 50/30/20, que couvrent les 20% ?', es: 'En la regla 50/30/20, ¿qué cubren el 20%?' },
          options: [
            { en: 'Entertainment and dining out', fr: 'Divertissement et restaurants', es: 'Entretenimiento y restaurantes' },
            { en: 'Savings and debt repayment', fr: 'Épargne et remboursement de dettes', es: 'Ahorro y pago de deudas' },
            { en: 'Rent and utilities', fr: 'Loyer et factures', es: 'Alquiler y servicios' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w1l4',
        title: { en: 'Building an Emergency Fund', fr: 'Constituer un Fonds d\'Urgence', es: 'Construir un Fondo de Emergencia' },
        xp: 75,
        content: {
          en: `An emergency fund is money set aside specifically for unexpected expenses — a medical bill, a job loss, a car repair, or a broken appliance. Without it, any surprise expense forces you into debt.\n\nFinancial experts recommend saving 3 to 6 months of living expenses. This number sounds large, but you build it gradually. Start with a $500 or €500 mini-goal, then work toward one month, then three.\n\nWhere to keep it: a high-yield savings account or a stablecoin vault (like USDC on Solana) that is separate from your everyday spending account. The goal is accessibility — you should be able to access it within 24 hours — but separation prevents you from dipping into it casually.\n\nHow to build it fast: automate a transfer every payday (even $20 matters), sell unused items, cut one subscription, or save any cash windfalls like tax refunds or bonuses.\n\nAn emergency fund is the single most important financial tool for beginners. It breaks the cycle of debt and gives you breathing room to make better decisions when life gets unpredictable.`,
          fr: `Un fonds d'urgence est de l'argent mis de côté spécifiquement pour les dépenses imprévues — une facture médicale, une perte d'emploi, une réparation de voiture. Sans cela, toute dépense surprise vous force à vous endetter.\n\nLes experts financiers recommandent d'économiser 3 à 6 mois de dépenses de vie. Ce chiffre semble grand, mais on le construit progressivement. Commencez par un mini-objectif de 500€, puis visez un mois, puis trois.\n\nOù le garder : un compte épargne à rendement élevé ou un coffre stablecoin (comme USDC sur Solana) séparé de votre compte courant. L'objectif est l'accessibilité — vous devriez pouvoir y accéder en 24 heures — mais la séparation évite d'y puiser sans raison.\n\nUn fonds d'urgence est l'outil financier le plus important pour les débutants. Il rompt le cycle de la dette et vous donne de la flexibilité quand la vie devient imprévisible.`,
          es: `Un fondo de emergencia es dinero reservado específicamente para gastos inesperados — una factura médica, pérdida de empleo, reparación de auto. Sin él, cualquier gasto sorpresa te obliga a endeudarte.\n\nLos expertos financieros recomiendan ahorrar de 3 a 6 meses de gastos de vida. Esta cifra parece grande, pero se construye gradualmente. Empieza con una mini-meta de 500€, luego apunta a un mes, después a tres.\n\nDónde guardarlo: una cuenta de ahorro de alto rendimiento o una bóveda de stablecoin (como USDC en Solana) separada de tu cuenta de gastos diarios. El objetivo es la accesibilidad — deberías poder acceder en 24 horas — pero la separación evita usarlo casualmente.\n\nUn fondo de emergencia es la herramienta financiera más importante para principiantes. Rompe el ciclo de la deuda y te da espacio para tomar mejores decisiones cuando la vida se vuelve impredecible.`,
        },
        quiz: {
          question: { en: 'What is the recommended size of an emergency fund?', fr: 'Quelle est la taille recommandée d\'un fonds d\'urgence ?', es: '¿Cuál es el tamaño recomendado de un fondo de emergencia?' },
          options: [
            { en: '1 week of salary', fr: '1 semaine de salaire', es: '1 semana de salario' },
            { en: '3 to 6 months of living expenses', fr: '3 à 6 mois de dépenses de vie', es: '3 a 6 meses de gastos de vida' },
            { en: 'Your total annual income', fr: 'Votre revenu annuel total', es: 'Tu ingreso anual total' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w1boss',
        title: { en: '⚔️ Money Basics Challenge', fr: '⚔️ Défi Bases de l\'Argent', es: '⚔️ Desafío Bases del Dinero' },
        xp: 150,
        isChallenge: true,
        content: {
          en: `This is the World 1 Boss Challenge! You've learned about the nature of money, tracking income and expenses, the 50/30/20 budgeting rule, and building an emergency fund.\n\nThese four concepts form the bedrock of financial stability. A person who tracks their money, follows a budget framework, and has an emergency fund is already ahead of most people when it comes to financial resilience.\n\nRemember the key insights:\n- Money is a tool; understanding it empowers you\n- Tracking expenses reveals where money silently escapes\n- The 50/30/20 rule gives structure without being rigid\n- An emergency fund breaks the debt cycle\n\nAnswer the challenge question to earn your 150 XP bonus and unlock World 2!`,
          fr: `C'est le Défi du Boss du Monde 1 ! Vous avez appris la nature de l'argent, le suivi des revenus et dépenses, la règle 50/30/20 et la constitution d'un fonds d'urgence.\n\nCes quatre concepts forment le socle de la stabilité financière. Répondez correctement pour gagner 150 XP et débloquer le Monde 2 !`,
          es: `¡Este es el Desafío del Jefe del Mundo 1! Has aprendido sobre la naturaleza del dinero, el seguimiento de ingresos y gastos, la regla 50/30/20 y la construcción de un fondo de emergencia.\n\nResponde correctamente para ganar 150 XP y desbloquear el Mundo 2!`,
        },
        quiz: {
          question: { en: 'Which combination best describes a financially healthy beginner?', fr: 'Quelle combinaison décrit le mieux un débutant financièrement sain ?', es: '¿Qué combinación describe mejor a un principiante financieramente sano?' },
          options: [
            { en: 'Tracks expenses + has an emergency fund + follows a budget', fr: 'Suit ses dépenses + fonds d\'urgence + suit un budget', es: 'Rastrea gastos + fondo de emergencia + sigue un presupuesto' },
            { en: 'Earns a high income but spends everything', fr: 'Gagne beaucoup mais dépense tout', es: 'Gana mucho pero gasta todo' },
            { en: 'Has many credit cards to cover emergencies', fr: 'A plusieurs cartes de crédit pour les urgences', es: 'Tiene muchas tarjetas de crédito para emergencias' },
          ],
          correctIndex: 0,
        },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // WORLD 2 — 🛡️ Protect Your Money
  // ─────────────────────────────────────────────
  {
    id: 'world2',
    title:       { en: '🛡️ Protect Your Money', fr: '🛡️ Protéger Son Argent', es: '🛡️ Proteger Tu Dinero' },
    description: { en: 'Learn to shield your savings from inflation, debt, and market chaos.', fr: 'Apprenez à protéger vos économies de l\'inflation, des dettes et du chaos des marchés.', es: 'Aprende a proteger tus ahorros de la inflación, las deudas y el caos del mercado.' },
    color: 'from-blue-500 to-cyan-600',
    lessons: [
      {
        id: 'w2l1',
        title: { en: 'Inflation — Your Silent Enemy', fr: 'L\'Inflation — Votre Ennemi Silencieux', es: 'La Inflación — Tu Enemigo Silencioso' },
        xp: 75,
        content: {
          en: `Inflation is the gradual increase in the price of goods and services over time, which reduces the purchasing power of your money. If inflation is 5% per year, something that costs $100 today will cost $105 next year.\n\nThis means cash sitting in a zero-interest account is actually losing value every year. At 5% inflation, $10,000 today will only buy what $9,524 buys in one year.\n\nInflation is caused by multiple factors: too much money chasing too few goods, supply chain disruptions, energy price spikes, and government monetary policy.\n\nTo protect against inflation, your savings need to grow at least as fast as inflation. Options include: high-yield savings accounts, inflation-indexed bonds (like TIPS in the US), real assets like real estate, and in some regions, dollar-pegged stablecoins like USDC which protect against local currency devaluation.\n\nThe key insight: doing nothing with cash is a slow loss. Understanding inflation motivates you to put every idle dollar to work in a smarter way.`,
          fr: `L'inflation est l'augmentation progressive du prix des biens et services dans le temps, ce qui réduit le pouvoir d'achat de votre argent. Si l'inflation est de 5% par an, quelque chose qui coûte 100€ aujourd'hui coûtera 105€ l'année prochaine.\n\nCela signifie que l'argent liquide dans un compte à zéro intérêt perd réellement de la valeur chaque année. À 5% d'inflation, 10 000€ aujourd'hui n'achèteront que l'équivalent de 9 524€ dans un an.\n\nPour se protéger contre l'inflation, vos économies doivent croître au moins aussi vite que l'inflation. Options : comptes épargne à rendement élevé, obligations indexées sur l'inflation, actifs réels comme l'immobilier, et stablecoins indexés sur le dollar comme l'USDC.`,
          es: `La inflación es el aumento gradual en el precio de bienes y servicios con el tiempo, que reduce el poder adquisitivo de tu dinero. Si la inflación es del 5% anual, algo que cuesta 100€ hoy costará 105€ el próximo año.\n\nEsto significa que el efectivo en una cuenta con cero interés está perdiendo valor cada año. Al 5% de inflación, 10.000€ hoy solo comprarán lo equivalente a 9.524€ en un año.\n\nPara protegerse contra la inflación, tus ahorros necesitan crecer al menos tan rápido como la inflación. Opciones: cuentas de ahorro de alto rendimiento, bonos indexados a la inflación, activos reales como bienes raíces, y stablecoins vinculadas al dólar como USDC.`,
        },
        quiz: {
          question: { en: 'If inflation is 5% and your savings earn 1%, what is happening to your money?', fr: 'Si l\'inflation est de 5% et vos économies rapportent 1%, que se passe-t-il ?', es: 'Si la inflación es del 5% y tus ahorros generan 1%, ¿qué está pasando?' },
          options: [
            { en: 'It is growing in real value', fr: 'Il croît en valeur réelle', es: 'Está creciendo en valor real' },
            { en: 'It is losing purchasing power by ~4% per year', fr: 'Il perd du pouvoir d\'achat d\'environ 4% par an', es: 'Está perdiendo poder adquisitivo en ~4% al año' },
            { en: 'It stays the same because numbers go up', fr: 'Il reste le même car les chiffres augmentent', es: 'Se mantiene igual porque los números suben' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w2l2',
        title: { en: 'Savings Strategies', fr: 'Stratégies d\'Épargne', es: 'Estrategias de Ahorro' },
        xp: 75,
        content: {
          en: `Saving money is not just about putting money aside — it's about a system that works automatically so you don't rely on willpower alone.\n\nPay yourself first: the moment you receive income, transfer a fixed amount to savings before paying any bills or spending. Even 5-10% is a strong start. This reverses the common habit of saving "whatever is left over" (which is usually nothing).\n\nAutomate everything: set up recurring transfers to a separate savings account on payday. Banks and neobanks make this easy. What you don't see, you don't spend.\n\nThe savings ladder: start with a liquid emergency fund, then build a medium-term goal fund (vacation, big purchase), then long-term wealth (retirement, investment accounts). Each step has a different account and purpose.\n\nAvoid savings killers: lifestyle inflation (spending more as you earn more), impulse buying, and subscription creep (paying for services you've forgotten about).\n\nSmall numbers compound: saving $100 per month for 10 years at 5% annual return becomes over $15,000. The habit is more important than the amount — start small and be consistent.`,
          fr: `Épargner n'est pas seulement mettre de l'argent de côté — c'est un système qui fonctionne automatiquement sans dépendre de la volonté seule.\n\nPayez-vous d'abord : au moment où vous recevez un revenu, transférez un montant fixe vers l'épargne avant de payer des factures. Même 5-10% est un bon début.\n\nAutomatisez tout : mettez en place des virements récurrents vers un compte épargne séparé le jour de paie. Ce que vous ne voyez pas, vous ne le dépensez pas.\n\nL'échelle d'épargne : commencez par un fonds d'urgence liquide, puis un fonds à moyen terme, puis la richesse à long terme. Chaque étape a un compte et un but différents.`,
          es: `Ahorrar no es solo reservar dinero — es un sistema que funciona automáticamente sin depender solo de la fuerza de voluntad.\n\nPágate primero: en el momento en que recibes ingresos, transfiere una cantidad fija a ahorros antes de pagar facturas. Incluso 5-10% es un gran comienzo.\n\nAutomatiza todo: configura transferencias recurrentes a una cuenta de ahorro separada el día de pago. Lo que no ves, no lo gastas.\n\nLa escalera de ahorro: comienza con un fondo de emergencia líquido, luego un fondo a mediano plazo, luego riqueza a largo plazo. Cada paso tiene una cuenta y un propósito diferente.`,
        },
        quiz: {
          question: { en: 'What does "pay yourself first" mean?', fr: 'Que signifie "se payer en premier" ?', es: '¿Qué significa "págate primero"?' },
          options: [
            { en: 'Spend on fun things before bills', fr: 'Dépenser pour le plaisir avant les factures', es: 'Gastar en cosas divertidas antes que en facturas' },
            { en: 'Transfer to savings immediately when income arrives, before other expenses', fr: 'Transférer vers l\'épargne dès que le revenu arrive, avant les autres dépenses', es: 'Transferir a ahorros inmediatamente cuando llega el ingreso, antes que otros gastos' },
            { en: 'Save whatever is left at month end', fr: 'Épargner ce qui reste en fin de mois', es: 'Ahorrar lo que quede al final del mes' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w2l3',
        title: { en: 'What is USDC?', fr: 'Qu\'est-ce que l\'USDC ?', es: '¿Qué es USDC?' },
        xp: 100,
        content: {
          en: `USDC (USD Coin) is a stablecoin — a type of cryptocurrency that is pegged 1:1 to the US Dollar. This means 1 USDC always equals $1. It is issued by Circle and is one of the most regulated and transparent stablecoins in existence.\n\nWhy use USDC instead of cash? In many countries, holding dollars is difficult or restricted. USDC gives anyone with a smartphone access to dollar-denominated savings, protecting against local currency devaluation and high inflation.\n\nOn Solana, USDC transactions settle in less than a second for a fraction of a cent in fees. This makes it practical for everyday use, micro-savings, and DeFi protocols.\n\nHow is it backed? Circle holds an equivalent amount of US dollars and short-term US government bonds in regulated bank accounts. Monthly audits by major accounting firms confirm the reserves.\n\nUSDC is not an investment — its value doesn't grow. It's a tool for stability and dollar access. Combine it with yield-generating DeFi protocols to earn interest while maintaining dollar parity. SafeHaven uses USDC as the safe-haven asset in its protection strategy.`,
          fr: `L'USDC (USD Coin) est un stablecoin — une cryptomonnaie indexée 1:1 sur le dollar américain. Cela signifie que 1 USDC vaut toujours 1$. Il est émis par Circle et est l'un des stablecoins les plus réglementés.\n\nPourquoi utiliser l'USDC plutôt que du liquide ? Dans de nombreux pays, détenir des dollars est difficile. L'USDC donne à toute personne avec un smartphone accès à des économies en dollars, protégeant contre la dévaluation de la monnaie locale.\n\nSur Solana, les transactions USDC se règlent en moins d'une seconde pour une fraction de centime. L'USDC n'est pas un investissement — sa valeur ne croît pas. C'est un outil de stabilité et d'accès au dollar.`,
          es: `USDC (USD Coin) es una stablecoin — una criptomoneda vinculada 1:1 al dólar estadounidense. Esto significa que 1 USDC siempre equivale a $1. Es emitida por Circle y es una de las stablecoins más reguladas.\n\n¿Por qué usar USDC en lugar de efectivo? En muchos países, tener dólares es difícil. USDC le da a cualquier persona con un smartphone acceso a ahorros denominados en dólares, protegiéndose de la devaluación de la moneda local.\n\nEn Solana, las transacciones USDC se liquidan en menos de un segundo por una fracción de centavo. USDC no es una inversión — su valor no crece. Es una herramienta de estabilidad y acceso al dólar.`,
        },
        quiz: {
          question: { en: 'What makes USDC a "stablecoin"?', fr: 'Qu\'est-ce qui fait de l\'USDC un "stablecoin" ?', es: '¿Qué hace que USDC sea una "stablecoin"?' },
          options: [
            { en: 'It generates high annual returns automatically', fr: 'Il génère des rendements annuels élevés automatiquement', es: 'Genera altos rendimientos anuales automáticamente' },
            { en: 'Its value is pegged 1:1 to the US Dollar', fr: 'Sa valeur est indexée 1:1 sur le dollar américain', es: 'Su valor está vinculado 1:1 al dólar estadounidense' },
            { en: 'It is backed by gold reserves', fr: 'Il est adossé à des réserves d\'or', es: 'Está respaldado por reservas de oro' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w2l4',
        title: { en: 'Controlling Debt', fr: 'Maîtriser la Dette', es: 'Controlar la Deuda' },
        xp: 100,
        content: {
          en: `Not all debt is bad. A mortgage to buy a home or a student loan for education can be productive debt that builds wealth. But high-interest consumer debt — credit cards charging 20-30% annually — is one of the biggest wealth destroyers.\n\nTwo main strategies for paying down debt:\n\n1. The Avalanche Method: Pay the minimum on all debts, then throw every extra dollar at the debt with the highest interest rate. This is mathematically optimal — you pay the least total interest.\n\n2. The Snowball Method: Pay the minimum on all debts, then attack the smallest balance first. When that's paid off, roll that payment onto the next smallest. The psychological wins of eliminating debts keep you motivated.\n\nAvoid new high-interest debt while paying down existing debt. Cancel store credit cards, negotiate lower interest rates with your bank, and look for balance transfer options if rates are high.\n\nEmergency fund first: before aggressively paying debt, build a small emergency fund ($500-1000) so that an unexpected expense doesn't force you to take on new debt, canceling your progress.`,
          fr: `Toutes les dettes ne sont pas mauvaises. Un prêt hypothécaire ou un prêt étudiant peut être une dette productive. Mais la dette à intérêts élevés — cartes de crédit à 20-30% annuels — est l'un des plus grands destructeurs de richesse.\n\nDeux stratégies principales :\n\n1. La Méthode Avalanche : Payez le minimum sur toutes les dettes, puis mettez chaque euro supplémentaire sur la dette avec le taux d'intérêt le plus élevé. Mathématiquement optimal.\n\n2. La Méthode Boule de Neige : Attaquez d'abord le solde le plus petit. Les victoires psychologiques vous gardent motivés.\n\nEvitez les nouvelles dettes à intérêts élevés pendant que vous remboursez les dettes existantes.`,
          es: `No todas las deudas son malas. Una hipoteca o un préstamo estudiantil puede ser deuda productiva. Pero la deuda de consumo con altos intereses — tarjetas de crédito al 20-30% anual — es uno de los mayores destructores de riqueza.\n\nDos estrategias principales:\n\n1. El Método Avalancha: Paga el mínimo en todas las deudas, luego destina cada euro extra a la deuda con el tipo de interés más alto. Óptimo matemáticamente.\n\n2. El Método Bola de Nieve: Ataca primero el saldo más pequeño. Las victorias psicológicas te mantienen motivado.\n\nEvita nuevas deudas de alto interés mientras pagas las deudas existentes.`,
        },
        quiz: {
          question: { en: 'The Avalanche debt method prioritizes:', fr: 'La méthode Avalanche priorise :', es: 'El método Avalancha prioriza:' },
          options: [
            { en: 'The debt with the smallest balance', fr: 'La dette avec le solde le plus petit', es: 'La deuda con el saldo más pequeño' },
            { en: 'The debt with the highest interest rate', fr: 'La dette avec le taux d\'intérêt le plus élevé', es: 'La deuda con el tipo de interés más alto' },
            { en: 'The most recent debt', fr: 'La dette la plus récente', es: 'La deuda más reciente' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w2boss',
        title: { en: '⚔️ Protection Challenge', fr: '⚔️ Défi Protection', es: '⚔️ Desafío Protección' },
        xp: 200,
        isChallenge: true,
        content: {
          en: `World 2 Boss Challenge! You've mastered the art of protecting your money from inflation, building smart savings habits, understanding USDC stablecoins, and controlling debt.\n\nThese tools work together: a savings habit funds your emergency buffer, USDC protects against devaluation, and the debt avalanche accelerates your path to financial freedom.\n\nA person who applies these four principles is genuinely protected against the most common financial threats. Answer the final question to earn 200 XP!`,
          fr: `Défi du Boss Monde 2 ! Vous avez maîtrisé l'inflation, les stratégies d'épargne, l'USDC et le contrôle des dettes. Répondez correctement pour gagner 200 XP !`,
          es: `¡Desafío del Jefe Mundo 2! Has dominado la inflación, las estrategias de ahorro, USDC y el control de deudas. ¡Responde correctamente para ganar 200 XP!`,
        },
        quiz: {
          question: { en: 'Which action best protects savings from local currency inflation?', fr: 'Quelle action protège le mieux les économies de l\'inflation de la monnaie locale ?', es: '¿Qué acción protege mejor los ahorros de la inflación de la moneda local?' },
          options: [
            { en: 'Keeping all money in a zero-interest current account', fr: 'Garder tout l\'argent dans un compte courant à zéro intérêt', es: 'Mantener todo el dinero en una cuenta corriente de cero interés' },
            { en: 'Converting savings to USDC or a high-yield instrument', fr: 'Convertir les économies en USDC ou instrument à haut rendement', es: 'Convertir ahorros a USDC o un instrumento de alto rendimiento' },
            { en: 'Spending all money immediately before inflation hits', fr: 'Dépenser tout l\'argent immédiatement avant l\'inflation', es: 'Gastar todo el dinero inmediatamente antes de la inflación' },
          ],
          correctIndex: 1,
        },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // WORLD 3 — ⛓️ Blockchain & Wallets
  // ─────────────────────────────────────────────
  {
    id: 'world3',
    title:       { en: '⛓️ Blockchain & Wallets', fr: '⛓️ Blockchain & Wallets', es: '⛓️ Blockchain y Wallets' },
    description: { en: 'Understand the technology behind crypto and how to stay safe on-chain.', fr: 'Comprenez la technologie derrière la crypto et comment rester en sécurité on-chain.', es: 'Entiende la tecnología detrás de las criptomonedas y cómo mantenerte seguro on-chain.' },
    color: 'from-purple-500 to-violet-600',
    lessons: [
      {
        id: 'w3l1',
        title: { en: 'What is Blockchain?', fr: 'Qu\'est-ce que la Blockchain ?', es: '¿Qué es la Blockchain?' },
        xp: 100,
        content: {
          en: `A blockchain is a distributed ledger — a database that is shared and synchronized across thousands of computers worldwide, with no single owner or controller. Each record (called a "block") is linked to the previous one, forming a chain.\n\nKey properties that make blockchain useful:\n\n- Immutability: once data is written to the blockchain, it cannot be altered or deleted. Every transaction is permanent.\n- Transparency: anyone can verify transactions on a public blockchain. There is no hidden manipulation.\n- Decentralization: no single company, government, or person controls the data.\n- Trustlessness: you don't need to trust a bank or intermediary — the math and code enforce the rules.\n\nBlockchain enables peer-to-peer financial transactions without banks. Bitcoin was the first major blockchain (2009). Since then, thousands of blockchains have emerged with different trade-offs between speed, cost, and decentralization.\n\nPractical implication: when you send USDC on Solana, the transaction is verified by thousands of computers and recorded permanently — no bank can freeze it, reverse it, or charge excessive fees.`,
          fr: `Une blockchain est un registre distribué — une base de données partagée sur des milliers d'ordinateurs dans le monde, sans propriétaire unique. Chaque enregistrement (appelé "bloc") est lié au précédent.\n\nPropriétés clés :\n- Immuabilité : les données ne peuvent être ni modifiées ni supprimées\n- Transparence : n'importe qui peut vérifier les transactions\n- Décentralisation : aucun contrôle central\n- Sans confiance requise : les règles sont appliquées par le code\n\nLa blockchain permet les transactions peer-to-peer sans banques. Quand vous envoyez de l'USDC sur Solana, la transaction est vérifiée par des milliers d'ordinateurs et enregistrée de façon permanente.`,
          es: `Una blockchain es un libro mayor distribuido — una base de datos compartida en miles de computadoras en todo el mundo, sin un propietario único. Cada registro (llamado "bloque") está vinculado al anterior.\n\nPropiedades clave:\n- Inmutabilidad: los datos no pueden modificarse ni eliminarse\n- Transparencia: cualquiera puede verificar las transacciones\n- Descentralización: sin control central\n- Sin confianza requerida: las reglas las aplica el código\n\nLa blockchain permite transacciones peer-to-peer sin bancos. Cuando envías USDC en Solana, la transacción es verificada por miles de computadoras y registrada de forma permanente.`,
        },
        quiz: {
          question: { en: 'What does "immutability" mean in the context of blockchain?', fr: 'Que signifie "immuabilité" dans le contexte de la blockchain ?', es: '¿Qué significa "inmutabilidad" en el contexto de la blockchain?' },
          options: [
            { en: 'Data can be edited by administrators', fr: 'Les données peuvent être modifiées par les administrateurs', es: 'Los datos pueden ser editados por administradores' },
            { en: 'Once recorded, data cannot be changed or deleted', fr: 'Une fois enregistrées, les données ne peuvent être ni modifiées ni supprimées', es: 'Una vez registrados, los datos no pueden cambiarse ni eliminarse' },
            { en: 'The blockchain can be paused in emergencies', fr: 'La blockchain peut être mise en pause en cas d\'urgence', es: 'La blockchain puede pausarse en emergencias' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w3l2',
        title: { en: 'What is Solana?', fr: 'Qu\'est-ce que Solana ?', es: '¿Qué es Solana?' },
        xp: 100,
        content: {
          en: `Solana is a high-performance blockchain built for speed and low cost. While Bitcoin processes ~7 transactions per second and Ethereum ~15-30, Solana handles up to 65,000 transactions per second with fees typically under $0.001.\n\nSolana uses a unique consensus mechanism called Proof of History (PoH) combined with Proof of Stake (PoS). PoH creates a historical record that proves events happened at a specific time, allowing validators to process transactions in parallel rather than sequentially.\n\nWhy Solana for SafeHaven? The combination of speed and low cost makes it practical for everyday financial use — micro-savings, small transfers, and DeFi interactions that would be prohibitively expensive on other chains.\n\nSOL is the native token of Solana, used to pay transaction fees (called "gas"). You need a small amount of SOL in your wallet to perform any operation on Solana.\n\nSolana's ecosystem includes hundreds of DeFi protocols, NFT marketplaces, and applications. Major stablecoins like USDC and USDT are natively available on Solana, making it an excellent base for safe, stable on-chain saving.`,
          fr: `Solana est une blockchain haute performance construite pour la vitesse et le faible coût. Pendant que Bitcoin traite ~7 transactions par seconde, Solana en gère jusqu'à 65 000 avec des frais généralement inférieurs à 0,001$.\n\nSolana utilise Proof of History (PoH) combiné avec Proof of Stake (PoS), permettant aux validateurs de traiter les transactions en parallèle.\n\nPourquoi Solana pour SafeHaven ? La combinaison vitesse/faible coût le rend pratique pour un usage financier quotidien. SOL est le token natif utilisé pour payer les frais de transaction.`,
          es: `Solana es una blockchain de alto rendimiento construida para velocidad y bajo costo. Mientras Bitcoin procesa ~7 transacciones por segundo, Solana maneja hasta 65.000 con tarifas generalmente inferiores a $0.001.\n\nSolana usa Proof of History (PoH) combinado con Proof of Stake (PoS), permitiendo a los validadores procesar transacciones en paralelo.\n\n¿Por qué Solana para SafeHaven? La combinación velocidad/bajo costo lo hace práctico para uso financiero cotidiano. SOL es el token nativo usado para pagar las tarifas de transacción.`,
        },
        quiz: {
          question: { en: 'Why is Solana particularly suitable for everyday micro-transactions?', fr: 'Pourquoi Solana est-il particulièrement adapté aux micro-transactions quotidiennes ?', es: '¿Por qué Solana es particularmente adecuado para micro-transacciones cotidianas?' },
          options: [
            { en: 'It is the oldest and most trusted blockchain', fr: 'C\'est la blockchain la plus ancienne et la plus fiable', es: 'Es la blockchain más antigua y confiable' },
            { en: 'It offers very high speed with fees under $0.001', fr: 'Il offre une très haute vitesse avec des frais inférieurs à 0,001$', es: 'Ofrece muy alta velocidad con tarifas por debajo de $0.001' },
            { en: 'It does not require any fees at all', fr: 'Il ne nécessite aucun frais du tout', es: 'No requiere ninguna tarifa en absoluto' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w3l3',
        title: { en: 'Private Keys & Wallets', fr: 'Clés Privées & Wallets', es: 'Claves Privadas y Wallets' },
        xp: 125,
        content: {
          en: `A crypto wallet doesn't "store" your crypto — your funds live on the blockchain. What your wallet stores is the private key: a unique cryptographic secret that proves ownership and allows you to sign transactions.\n\nHow it works: every wallet has a public key (like an email address — you share it to receive funds) and a private key (like a password — you never share it). The private key mathematically generates the public key, but not the reverse.\n\nSeed phrase (mnemonic): your private key is represented as 12 or 24 random words. This is your master backup. If you lose your device, you can recover your wallet with just the seed phrase — on any device. NEVER share it, take a screenshot of it, or store it digitally.\n\nTypes of wallets:\n- Hot wallets (Phantom, Backpack): connected to the internet, convenient for daily use\n- Cold wallets (Ledger, Trezor): hardware devices, offline, maximum security for large amounts\n\nGolden rule: not your keys, not your coins. If you leave crypto on an exchange, the exchange controls your keys. Self-custody means you are the sole owner — but also the sole responsible party.`,
          fr: `Un wallet crypto ne "stocke" pas vos cryptos — vos fonds sont sur la blockchain. Ce que stocke votre wallet, c'est la clé privée : un secret cryptographique unique qui prouve la propriété.\n\nChaque wallet a une clé publique (comme une adresse e-mail) et une clé privée (comme un mot de passe). La phrase secrète (12 ou 24 mots) est votre sauvegarde principale. Ne la partagez JAMAIS.\n\nTypes de wallets :\n- Wallets chauds (Phantom, Backpack) : connectés à internet\n- Wallets froids (Ledger, Trezor) : hors ligne, sécurité maximale\n\nRègle d'or : pas vos clés, pas vos coins.`,
          es: `Un wallet de criptomonedas no "almacena" tus criptos — tus fondos están en la blockchain. Lo que almacena tu wallet es la clave privada: un secreto criptográfico único que prueba la propiedad.\n\nCada wallet tiene una clave pública (como un correo electrónico) y una clave privada (como una contraseña). La frase semilla (12 o 24 palabras) es tu respaldo maestro. NUNCA la compartas.\n\nTipos de wallets:\n- Wallets calientes (Phantom, Backpack): conectados a internet\n- Wallets fríos (Ledger, Trezor): fuera de línea, máxima seguridad\n\nRegla de oro: sin tus claves, no son tus monedas.`,
        },
        quiz: {
          question: { en: 'What should you do with your wallet\'s seed phrase?', fr: 'Que devez-vous faire avec la phrase secrète de votre wallet ?', es: '¿Qué debes hacer con la frase semilla de tu wallet?' },
          options: [
            { en: 'Share it with customer support if you need help', fr: 'La partager avec le support client si vous avez besoin d\'aide', es: 'Compartirla con soporte al cliente si necesitas ayuda' },
            { en: 'Store it in a screenshot on your phone', fr: 'La stocker dans une capture d\'écran sur votre téléphone', es: 'Guardarla en una captura de pantalla en tu teléfono' },
            { en: 'Write it on paper and store it securely offline — never share it', fr: 'L\'écrire sur papier et la stocker en sécurité hors ligne — ne jamais la partager', es: 'Escribirla en papel y guardarla de forma segura fuera de línea — nunca compartirla' },
          ],
          correctIndex: 2,
        },
      },
      {
        id: 'w3l4',
        title: { en: 'Staying Safe On-Chain', fr: 'Rester en Sécurité On-Chain', es: 'Mantenerse Seguro On-Chain' },
        xp: 125,
        content: {
          en: `The decentralized nature of crypto means there are no chargebacks, no customer support lines, and no "undo" button. Security is entirely your responsibility. Here are the most critical practices:\n\nVerify every address: before sending any transaction, double-check the destination address character by character. Malware called "clipboard hijackers" can silently replace addresses you copied.\n\nRevoke token approvals: when you interact with DeFi protocols, you often grant them permission ("approval") to spend your tokens. Regularly check and revoke unused approvals using tools like Revoke.cash.\n\nBeware of phishing: scammers create fake websites that look identical to real protocols. Always navigate to sites by typing the URL directly or using bookmarks. Never click links in DMs.\n\nUse a hardware wallet for large amounts: if you have significant savings, a Ledger or Trezor keeps your private key completely offline.\n\nTest with small amounts: before sending a large transfer, send a small test transaction first to confirm the address is correct.\n\nSimulation tools: use wallets that show transaction simulation (what will happen before you confirm). Never approve a transaction you don't fully understand.`,
          fr: `La nature décentralisée de la crypto signifie qu'il n'y a pas de remboursements ni de bouton "annuler". La sécurité est entièrement de votre responsabilité.\n\nVérifiez chaque adresse : avant d'envoyer une transaction, vérifiez l'adresse de destination. Révoquez les approbations de tokens inutilisées avec des outils comme Revoke.cash. Méfiez-vous du phishing. Utilisez un hardware wallet pour les grosses sommes. Testez avec de petits montants.`,
          es: `La naturaleza descentralizada de las criptomonedas significa que no hay reembolsos ni botón "deshacer". La seguridad es completamente tu responsabilidad.\n\nVerifica cada dirección: antes de enviar cualquier transacción, verifica el carácter a carácter. Revoca las aprobaciones de tokens no utilizadas con herramientas como Revoke.cash. Cuidado con el phishing. Usa un hardware wallet para grandes cantidades. Prueba con pequeñas cantidades.`,
        },
        quiz: {
          question: { en: 'What is a "clipboard hijacker" attack?', fr: 'Qu\'est-ce qu\'une attaque "clipboard hijacker" ?', es: '¿Qué es un ataque "clipboard hijacker"?' },
          options: [
            { en: 'A virus that deletes your clipboard history', fr: 'Un virus qui supprime l\'historique de votre presse-papiers', es: 'Un virus que borra tu historial del portapapeles' },
            { en: 'Malware that silently replaces copied wallet addresses with an attacker\'s address', fr: 'Malware qui remplace silencieusement les adresses de wallet copiées par celle d\'un attaquant', es: 'Malware que silenciosamente reemplaza las direcciones de wallet copiadas por la del atacante' },
            { en: 'A scam that locks your clipboard until you pay a ransom', fr: 'Une arnaque qui verrouille votre presse-papiers jusqu\'à ce que vous payiez une rançon', es: 'Una estafa que bloquea tu portapapeles hasta que pagas un rescate' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w3boss',
        title: { en: '⚔️ Crypto Knowledge Test', fr: '⚔️ Test de Connaissances Crypto', es: '⚔️ Test de Conocimientos Crypto' },
        xp: 250,
        isChallenge: true,
        content: {
          en: `World 3 Boss Challenge! You've explored the fundamentals of blockchain technology, Solana's unique advantages, how private keys and wallets work, and best practices for on-chain security.\n\nThis knowledge is the foundation for safely participating in the crypto ecosystem. Most people lose funds not from market losses but from security mistakes — and you are now equipped to avoid them.\n\nAnswer the challenge question to earn 250 XP and unlock World 4 — DeFi & Yields!`,
          fr: `Défi du Boss Monde 3 ! Vous avez exploré la blockchain, les avantages de Solana, les clés privées et la sécurité on-chain. Répondez pour gagner 250 XP !`,
          es: `¡Desafío del Jefe Mundo 3! Has explorado blockchain, las ventajas de Solana, las claves privadas y la seguridad on-chain. ¡Responde para ganar 250 XP!`,
        },
        quiz: {
          question: { en: 'What does "not your keys, not your coins" mean?', fr: 'Que signifie "pas vos clés, pas vos coins" ?', es: '¿Qué significa "sin tus claves, no son tus monedas"?' },
          options: [
            { en: 'You should always use an exchange for safety', fr: 'Vous devriez toujours utiliser un exchange pour la sécurité', es: 'Siempre debes usar un exchange para mayor seguridad' },
            { en: 'If you don\'t control the private key, you don\'t truly own the crypto', fr: 'Si vous ne contrôlez pas la clé privée, vous ne possédez pas vraiment les crypto', es: 'Si no controlas la clave privada, no posees realmente las criptomonedas' },
            { en: 'Only physical coins count as real crypto', fr: 'Seules les pièces physiques comptent comme de vraies crypto', es: 'Solo las monedas físicas cuentan como cripto real' },
          ],
          correctIndex: 1,
        },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // WORLD 4 — 🌾 DeFi & Yields
  // ─────────────────────────────────────────────
  {
    id: 'world4',
    title:       { en: '🌾 DeFi & Yields', fr: '🌾 DeFi & Rendements', es: '🌾 DeFi y Rendimientos' },
    description: { en: 'Put your USDC to work and earn yield without giving up custody.', fr: 'Faites travailler vos USDC et gagnez des rendements sans perdre la garde.', es: 'Pon tu USDC a trabajar y gana rendimientos sin ceder la custodia.' },
    color: 'from-green-500 to-emerald-600',
    lessons: [
      {
        id: 'w4l1',
        title: { en: 'What is DeFi?', fr: 'Qu\'est-ce que la DeFi ?', es: '¿Qué es DeFi?' },
        xp: 125,
        content: {
          en: `DeFi stands for Decentralized Finance — financial services built on public blockchains that operate without banks, brokers, or other intermediaries. Anyone with a wallet and an internet connection can access them.\n\nTraditional finance (TradFi) relies on institutions: you deposit money at a bank, the bank lends it to others and gives you interest. The bank controls your account and can freeze it. DeFi replaces the bank with smart contracts — self-executing code that runs on the blockchain.\n\nCore DeFi primitives:\n- DEX (Decentralized Exchange): swap tokens without an intermediary (Jupiter, Orca on Solana)\n- Lending protocols: deposit assets to earn interest, or borrow against collateral\n- Liquidity pools: provide trading liquidity and earn fees\n- Yield aggregators: automatically optimize yield across multiple protocols\n\nDeFi is permissionless: no KYC, no credit check, no account approval. Your wallet address is your identity. This opens financial access to billions of people who are unbanked or underserved by traditional finance.\n\nRisks to be aware of: smart contract bugs, liquidation risk in lending, impermanent loss in liquidity pools, and protocol hacks. Always research before depositing.`,
          fr: `DeFi signifie Finance Décentralisée — des services financiers construits sur des blockchains publiques, sans banques ni intermédiaires. Quiconque possède un wallet et une connexion internet peut y accéder.\n\nLa DeFi remplace les banques par des contrats intelligents — du code auto-exécutant sur la blockchain.\n\nPrimitives DeFi principales :\n- DEX : échange de tokens sans intermédiaire\n- Protocoles de prêt : déposez des actifs pour gagner des intérêts\n- Pools de liquidité : fournissez de la liquidité et gagnez des frais\n\nLa DeFi est sans permission : pas de KYC, pas de vérification de crédit. Votre adresse wallet est votre identité.`,
          es: `DeFi significa Finanzas Descentralizadas — servicios financieros construidos en blockchains públicas, sin bancos ni intermediarios. Cualquiera con una wallet y conexión a internet puede acceder.\n\nDeFi reemplaza los bancos con contratos inteligentes — código auto-ejecutable en la blockchain.\n\nPrimitivas DeFi principales:\n- DEX: intercambio de tokens sin intermediario\n- Protocolos de préstamo: deposita activos para ganar intereses\n- Pools de liquidez: proporciona liquidez y gana tarifas\n\nDeFi es sin permisos: sin KYC, sin verificación de crédito. Tu dirección wallet es tu identidad.`,
        },
        quiz: {
          question: { en: 'What replaces the bank in DeFi?', fr: 'Qu\'est-ce qui remplace la banque dans la DeFi ?', es: '¿Qué reemplaza al banco en DeFi?' },
          options: [
            { en: 'A government-backed digital currency', fr: 'Une monnaie numérique soutenue par le gouvernement', es: 'Una moneda digital respaldada por el gobierno' },
            { en: 'Smart contracts — self-executing code on the blockchain', fr: 'Des contrats intelligents — du code auto-exécutant sur la blockchain', es: 'Contratos inteligentes — código auto-ejecutable en la blockchain' },
            { en: 'A consortium of major banks', fr: 'Un consortium de grandes banques', es: 'Un consorcio de grandes bancos' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w4l2',
        title: { en: 'Lending & Borrowing', fr: 'Prêt & Emprunt', es: 'Préstamo y Endeudamiento' },
        xp: 125,
        content: {
          en: `DeFi lending protocols allow you to deposit (supply) assets to earn interest, or borrow assets by depositing collateral. The most important Solana DeFi lending protocols are Kamino Finance and MarginFi.\n\nHow lending works: you deposit USDC into a lending pool. Borrowers pay interest to use those funds. That interest is distributed to suppliers like you. Rates are determined algorithmically by supply and demand — when more people borrow, rates rise; when the pool is mostly unused, rates fall.\n\nHow borrowing works: to borrow, you first deposit collateral (e.g., SOL worth $200). You can then borrow up to a certain percentage of that collateral value (Loan-to-Value ratio, e.g., 75%). If SOL price drops and your position becomes undercollateralized, it gets liquidated — the protocol sells your collateral to repay the loan.\n\nKey metric: Health Factor. Stay above 1.0 (usually aim for 1.5+) to avoid liquidation.\n\nFor SafeHaven's strategy: supplying USDC to lending protocols is one of the safest DeFi activities — you earn yield (typically 3-8% APY on stablecoins) without exposure to price volatility.`,
          fr: `Les protocoles de prêt DeFi vous permettent de déposer des actifs pour gagner des intérêts, ou d'emprunter en déposant des garanties. Sur Solana : Kamino Finance et MarginFi.\n\nComment ça marche : vous déposez de l'USDC dans un pool de prêt. Les emprunteurs paient des intérêts. Ces intérêts sont distribués aux prêteurs comme vous.\n\nEmprunter : déposez des garanties (ex: SOL), puis empruntez jusqu'à un certain pourcentage (ratio prêt/valeur). Si la valeur de votre garantie baisse trop, vous serez liquidé.\n\nIndicateur clé : le Facteur de Santé. Restez au-dessus de 1,0 (visez 1,5+) pour éviter la liquidation.`,
          es: `Los protocolos de préstamo DeFi te permiten depositar activos para ganar intereses, o pedir prestado depositando garantías. En Solana: Kamino Finance y MarginFi.\n\nCómo funciona: depositas USDC en un pool de préstamos. Los prestatarios pagan intereses. Esos intereses se distribuyen a los prestamistas como tú.\n\nPedir prestado: deposita garantías (ej: SOL), luego pide prestado hasta cierto porcentaje (ratio préstamo/valor). Si el valor de tu garantía cae demasiado, serás liquidado.\n\nMétrica clave: el Factor de Salud. Mantente por encima de 1.0 (apunta a 1.5+) para evitar la liquidación.`,
        },
        quiz: {
          question: { en: 'What happens if your Health Factor drops below 1.0 in a DeFi lending protocol?', fr: 'Que se passe-t-il si votre Facteur de Santé tombe en dessous de 1,0 ?', es: '¿Qué sucede si tu Factor de Salud cae por debajo de 1.0?' },
          options: [
            { en: 'You receive a bonus reward', fr: 'Vous recevez une récompense bonus', es: 'Recibes una recompensa adicional' },
            { en: 'Your position gets liquidated to repay the loan', fr: 'Votre position est liquidée pour rembourser le prêt', es: 'Tu posición es liquidada para pagar el préstamo' },
            { en: 'Nothing happens — it is just a warning', fr: 'Rien ne se passe — c\'est juste un avertissement', es: 'Nada sucede — es solo una advertencia' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w4l3',
        title: { en: 'APY & Compound Interest', fr: 'APY & Intérêts Composés', es: 'APY e Interés Compuesto' },
        xp: 150,
        content: {
          en: `APY (Annual Percentage Yield) is the real return you earn on an investment over one year, taking into account the effect of compounding. It differs from APR (Annual Percentage Rate), which doesn't include compounding.\n\nCompound interest means earning interest on your interest. Albert Einstein allegedly called it "the eighth wonder of the world."\n\nExample: $1,000 at 10% APY for 10 years:\n- Without compounding (simple interest): $1,000 + 10 × $100 = $2,000\n- With compounding (APY): $1,000 × 1.10^10 ≈ $2,594\n\nThe difference grows dramatically over time. At 30 years, simple interest gives $4,000 but compound gives over $17,000.\n\nIn DeFi, compounding can happen continuously or daily. Auto-compounding vaults (like Kamino's yield strategies) automatically reinvest your earnings, maximizing APY without manual action.\n\nFor stable yields on USDC in DeFi:\n- Lending protocols: 3-8% APY\n- Liquidity pools with stable pairs: 4-12% APY\n- Leveraged strategies (higher risk): 10-30%+ APY\n\nKey principle: time is your greatest asset. Start early, reinvest earnings, and let compounding do the heavy lifting.`,
          fr: `APY (Rendement Annuel en Pourcentage) est le retour réel sur un investissement sur un an, en tenant compte de la composition.\n\nLes intérêts composés signifient gagner des intérêts sur vos intérêts. Exemple : 1 000$ à 10% APY pendant 10 ans = ~2 594$ (vs 2 000$ en intérêts simples).\n\nDans la DeFi, la composition peut être continue ou quotidienne. Les coffres auto-composés réinvestissent automatiquement vos gains.\n\nPour des rendements stables sur USDC : protocoles de prêt (3-8% APY), pools de liquidité avec paires stables (4-12% APY).`,
          es: `APY (Rendimiento Porcentual Anual) es el retorno real que ganas en una inversión durante un año, teniendo en cuenta el efecto del interés compuesto.\n\nEl interés compuesto significa ganar intereses sobre tus intereses. Ejemplo: $1.000 al 10% APY durante 10 años = ~$2.594 (vs $2.000 en interés simple).\n\nEn DeFi, la composición puede ser continua o diaria. Las bóvedas de auto-composición reinvierten automáticamente tus ganancias.\n\nPara rendimientos estables en USDC: protocolos de préstamo (3-8% APY), pools de liquidez con pares estables (4-12% APY).`,
        },
        quiz: {
          question: { en: 'What is the key difference between APR and APY?', fr: 'Quelle est la différence principale entre APR et APY ?', es: '¿Cuál es la diferencia clave entre APR y APY?' },
          options: [
            { en: 'APR is only for crypto, APY is for traditional finance', fr: 'APR est uniquement pour la crypto, APY pour la finance traditionnelle', es: 'APR es solo para cripto, APY es para finanzas tradicionales' },
            { en: 'APY includes the effect of compounding, APR does not', fr: 'APY inclut l\'effet de composition, APR non', es: 'APY incluye el efecto del interés compuesto, APR no' },
            { en: 'They are the same thing with different names', fr: 'Ce sont la même chose avec des noms différents', es: 'Son lo mismo con nombres diferentes' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w4l4',
        title: { en: 'Kamino & MarginFi', fr: 'Kamino & MarginFi', es: 'Kamino y MarginFi' },
        xp: 150,
        content: {
          en: `Kamino Finance and MarginFi are two of the most important DeFi protocols on Solana for earning yield on stable assets.\n\nKamino Finance offers automated liquidity strategies and a lending market. Its "multiply" and "leverage" features allow sophisticated yield strategies, but for SafeHaven users, the core use case is simple: deposit USDC into Kamino's lending market to earn competitive interest rates (often 4-8% APY on USDC) with full self-custody.\n\nMarginFi (now rebranding to mrgn) is a lending protocol focused on capital efficiency. It allows users to supply assets, earn yield, and access credit lines without centralized intermediaries. MarginFi's "marginfi points" program has also rewarded early users.\n\nHow to use safely:\n1. Connect your Phantom wallet\n2. Navigate to Kamino or MarginFi's official website (always check the URL)\n3. Supply USDC to the lending market\n4. Receive receipt tokens (kUSDC or similar) that represent your position\n5. Monitor your position and withdraw anytime\n\nSmart contract risk: both protocols have been audited, but no DeFi protocol is 100% risk-free. Only deposit what you can afford to have in the protocol, and diversify across protocols if holding large amounts.`,
          fr: `Kamino Finance et MarginFi sont deux des protocoles DeFi les plus importants sur Solana pour gagner des rendements sur les actifs stables.\n\nKamino offre des stratégies de liquidité automatisées et un marché de prêt. Pour les utilisateurs SafeHaven : déposez de l'USDC pour gagner 4-8% APY avec autocustodie complète.\n\nMarginFi est un protocole de prêt axé sur l'efficacité du capital. Comment utiliser en sécurité : connectez Phantom, naviguez sur le site officiel, déposez de l'USDC, recevez des tokens de reçu, surveillez et retirez à tout moment.`,
          es: `Kamino Finance y MarginFi son dos de los protocolos DeFi más importantes en Solana para ganar rendimiento en activos estables.\n\nKamino ofrece estrategias de liquidez automatizadas y un mercado de préstamos. Para los usuarios de SafeHaven: deposita USDC para ganar 4-8% APY con autocustodia completa.\n\nMarginFi es un protocolo de préstamo enfocado en la eficiencia del capital. Cómo usar de forma segura: conecta Phantom, navega al sitio oficial, deposita USDC, recibe tokens de recibo, monitorea y retira en cualquier momento.`,
        },
        quiz: {
          question: { en: 'What does supplying USDC to Kamino lending market primarily allow you to do?', fr: 'Que vous permet principalement de faire le dépôt d\'USDC sur le marché de prêt Kamino ?', es: '¿Qué te permite hacer principalmente depositar USDC en el mercado de préstamos de Kamino?' },
          options: [
            { en: 'Trade USDC for other cryptocurrencies at zero fees', fr: 'Échanger des USDC contre d\'autres cryptos sans frais', es: 'Intercambiar USDC por otras criptomonedas sin tarifas' },
            { en: 'Earn interest on your USDC while maintaining self-custody', fr: 'Gagner des intérêts sur vos USDC tout en conservant l\'autocustodie', es: 'Ganar intereses en tu USDC manteniendo la autocustodia' },
            { en: 'Convert USDC into physical US dollars', fr: 'Convertir des USDC en dollars américains physiques', es: 'Convertir USDC en dólares estadounidenses físicos' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w4boss',
        title: { en: '⚔️ DeFi Master Test', fr: '⚔️ Test Maître DeFi', es: '⚔️ Test Maestro DeFi' },
        xp: 300,
        isChallenge: true,
        content: {
          en: `World 4 Boss Challenge — DeFi Master Test! You've learned about decentralized finance, lending and borrowing mechanics, the power of compound interest via APY, and how to use Kamino and MarginFi on Solana.\n\nYou now understand how to put your USDC to work earning passive income while maintaining self-custody. This is the core SafeHaven value proposition: your money, working for you, safely.\n\nAnswer the challenge question to earn 300 XP and unlock the final world — Bridge & Grow!`,
          fr: `Défi du Boss Monde 4 ! Vous avez appris la DeFi, le prêt/emprunt, l'APY et les intérêts composés, et comment utiliser Kamino et MarginFi. Répondez pour gagner 300 XP !`,
          es: `¡Desafío del Jefe Mundo 4! Has aprendido DeFi, préstamo/endeudamiento, APY e interés compuesto, y cómo usar Kamino y MarginFi. ¡Responde para ganar 300 XP!`,
        },
        quiz: {
          question: { en: 'Which best describes the SafeHaven DeFi strategy for stable yields?', fr: 'Quelle description correspond le mieux à la stratégie DeFi SafeHaven pour des rendements stables ?', es: '¿Cuál describe mejor la estrategia DeFi de SafeHaven para rendimientos estables?' },
          options: [
            { en: 'Trade volatile tokens for maximum short-term gains', fr: 'Trader des tokens volatils pour des gains à court terme maximaux', es: 'Tradear tokens volátiles para máximas ganancias a corto plazo' },
            { en: 'Supply USDC to lending protocols and let compound interest grow savings safely', fr: 'Fournir des USDC aux protocoles de prêt et laisser les intérêts composés faire croître l\'épargne', es: 'Suministrar USDC a protocolos de préstamo y dejar que el interés compuesto haga crecer los ahorros' },
            { en: 'Hold all assets in SOL to benefit from price appreciation', fr: 'Détenir tous les actifs en SOL pour bénéficier de l\'appréciation des prix', es: 'Mantener todos los activos en SOL para beneficiarse de la apreciación del precio' },
          ],
          correctIndex: 1,
        },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // WORLD 5 — 🌉 Bridge & Grow
  // ─────────────────────────────────────────────
  {
    id: 'world5',
    title:       { en: '🌉 Bridge & Grow', fr: '🌉 Bridge & Croissance', es: '🌉 Bridge y Crecimiento' },
    description: { en: 'Move assets across chains and build your long-term wealth strategy.', fr: 'Déplacez des actifs entre chaînes et construisez votre stratégie de richesse à long terme.', es: 'Mueve activos entre cadenas y construye tu estrategia de riqueza a largo plazo.' },
    color: 'from-orange-500 to-rose-600',
    lessons: [
      {
        id: 'w5l1',
        title: { en: 'Cross-Chain Basics', fr: 'Bases du Cross-Chain', es: 'Bases del Cross-Chain' },
        xp: 150,
        content: {
          en: `Blockchains are like separate islands: Ethereum, Solana, BNB Chain, and others each have their own tokens, rules, and ecosystems. A "bridge" is a protocol that allows you to move assets from one blockchain to another.\n\nWhy bridge? You might have USDC on Ethereum but want to use it in Solana DeFi where fees are cheaper. Or you may receive funds on one chain but want to consolidate on another.\n\nHow bridges work: the most common mechanism is a lock-and-mint model. You lock USDC on Ethereum with a bridge contract; the contract then mints an equivalent amount of wrapped USDC on Solana. When you bridge back, the wrapped USDC is burned and the original is unlocked.\n\nBridge risks:\n- Smart contract exploits: bridges hold large amounts of locked assets and are attractive hacking targets. Several bridges have been hacked for hundreds of millions of dollars.\n- Wrapped vs native tokens: make sure you receive the correct native token, not an unsupported wrapped version.\n- Slippage and fees: bridging incurs fees on both source and destination chains, plus bridge protocol fees.\n\nBest practice: use well-audited, established bridges (like LI.FI, Wormhole, or Circle's CCTP for USDC), bridge only what you need, and verify the received asset on the destination chain.`,
          fr: `Les blockchains sont comme des îles séparées. Un "bridge" est un protocole qui permet de déplacer des actifs d'une blockchain à une autre.\n\nComment ça marche : le mécanisme lock-and-mint le plus courant — vous verrouillez de l'USDC sur Ethereum, le bridge frappe l'équivalent sur Solana.\n\nRisques des bridges : exploits de contrats intelligents (plusieurs bridges ont été piratés pour des centaines de millions), tokens enveloppés vs natifs, frais et slippage.\n\nMeilleures pratiques : utilisez des bridges établis (LI.FI, Wormhole, CCTP de Circle), ne bridge que ce dont vous avez besoin.`,
          es: `Las blockchains son como islas separadas. Un "bridge" es un protocolo que permite mover activos de una blockchain a otra.\n\nCómo funciona: el mecanismo lock-and-mint más común — bloqueas USDC en Ethereum, el bridge acuña el equivalente en Solana.\n\nRiesgos de los bridges: exploits de contratos inteligentes (varios bridges han sido hackeados por cientos de millones), tokens envueltos vs nativos, tarifas y deslizamiento.\n\nMejores prácticas: usa bridges establecidos (LI.FI, Wormhole, CCTP de Circle), bridgea solo lo que necesitas.`,
        },
        quiz: {
          question: { en: 'What is the main purpose of a blockchain bridge?', fr: 'Quel est l\'objectif principal d\'un bridge blockchain ?', es: '¿Cuál es el propósito principal de un bridge blockchain?' },
          options: [
            { en: 'To increase the speed of transactions on a single blockchain', fr: 'Pour augmenter la vitesse des transactions sur une seule blockchain', es: 'Para aumentar la velocidad de transacciones en una sola blockchain' },
            { en: 'To move assets from one blockchain network to another', fr: 'Pour déplacer des actifs d\'un réseau blockchain à un autre', es: 'Para mover activos de una red blockchain a otra' },
            { en: 'To create new cryptocurrency tokens', fr: 'Pour créer de nouveaux tokens de cryptomonnaie', es: 'Para crear nuevos tokens de criptomoneda' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w5l2',
        title: { en: 'LI.FI Bridge Tutorial', fr: 'Tutoriel Bridge LI.FI', es: 'Tutorial Bridge LI.FI' },
        xp: 150,
        content: {
          en: `LI.FI is a cross-chain aggregator that finds the best route for moving assets across blockchains. Instead of manually comparing bridges, LI.FI automatically identifies the cheapest, fastest, and safest path.\n\nHow LI.FI works: it aggregates multiple bridges (Wormhole, Stargate, deBridge, etc.) and DEXs across chains. When you request a transfer, LI.FI queries all routes and presents the best option, including estimated time, fees, and received amount.\n\nStep-by-step to bridge USDC from Ethereum to Solana via LI.FI:\n1. Connect your wallet (MetaMask for Ethereum, Phantom for Solana)\n2. Select source chain: Ethereum, source token: USDC\n3. Select destination chain: Solana, destination token: USDC\n4. Enter the amount to bridge\n5. Review the route, estimated time (~2-15 minutes), and fees\n6. Approve the transaction on Ethereum (this allows LI.FI to move your USDC)\n7. Confirm the bridge transaction\n8. Wait for the transfer to complete and verify USDC appears in your Solana wallet\n\nAlways double-check: the destination address is your own Solana wallet, the received token is native USDC (not a wrapped version), and you have enough SOL for Solana transaction fees.`,
          fr: `LI.FI est un agrégateur cross-chain qui trouve le meilleur itinéraire pour déplacer des actifs entre blockchains. Il agrège plusieurs bridges et DEX.\n\nÉtapes pour bridge de l'USDC d'Ethereum vers Solana :\n1. Connectez vos wallets\n2. Sélectionnez Ethereum → Solana, token USDC\n3. Entrez le montant\n4. Vérifiez l'itinéraire et les frais\n5. Approuvez sur Ethereum\n6. Confirmez la transaction de bridge\n7. Attendez la confirmation et vérifiez l'USDC dans votre wallet Solana`,
          es: `LI.FI es un agregador cross-chain que encuentra la mejor ruta para mover activos entre blockchains. Agrega múltiples bridges y DEXs.\n\nPasos para bridgear USDC de Ethereum a Solana:\n1. Conecta tus wallets\n2. Selecciona Ethereum → Solana, token USDC\n3. Ingresa el monto\n4. Revisa la ruta y las tarifas\n5. Aprueba en Ethereum\n6. Confirma la transacción de bridge\n7. Espera la confirmación y verifica el USDC en tu wallet de Solana`,
        },
        quiz: {
          question: { en: 'What is the main advantage of using LI.FI over a single bridge?', fr: 'Quel est le principal avantage d\'utiliser LI.FI par rapport à un seul bridge ?', es: '¿Cuál es la principal ventaja de usar LI.FI sobre un único bridge?' },
          options: [
            { en: 'LI.FI guarantees zero fees on all transfers', fr: 'LI.FI garantit des frais nuls sur tous les transferts', es: 'LI.FI garantiza cero tarifas en todas las transferencias' },
            { en: 'LI.FI aggregates multiple bridges to find the cheapest and fastest route automatically', fr: 'LI.FI agrège plusieurs bridges pour trouver automatiquement l\'itinéraire le moins cher et le plus rapide', es: 'LI.FI agrega múltiples bridges para encontrar automáticamente la ruta más barata y rápida' },
            { en: 'LI.FI only works with Bitcoin', fr: 'LI.FI ne fonctionne qu\'avec Bitcoin', es: 'LI.FI solo funciona con Bitcoin' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w5l3',
        title: { en: 'Your First Strategy', fr: 'Votre Première Stratégie', es: 'Tu Primera Estrategia' },
        xp: 200,
        content: {
          en: `Now you have all the building blocks to create your first personal financial strategy. Here's a practical starter framework:\n\nThe SafeHaven Starter Stack:\n\n1. Emergency Buffer (20% of savings): Keep in a liquid, zero-risk form — USDC in your Phantom wallet or a high-yield bank account. Accessible within minutes. Never invest this portion.\n\n2. Stable Yield Layer (50% of savings): Deposit into Kamino or MarginFi's USDC lending market. Earn 4-8% APY on money that would otherwise sit idle. Auto-compound for maximum effect.\n\n3. Growth Layer (30% of savings): A small allocation to higher-yield strategies — liquidity pools with stable pairs (4-12% APY), or a diversified token portfolio if you have a longer time horizon.\n\nMonthly routine:\n- Check your lending position's health factor\n- Review your APY and compare to alternatives\n- Add new savings to the stable yield layer first\n- Reinvest any earned yield (if not auto-compounding)\n\nStart conservative: begin with the emergency buffer and stable yield only. Add the growth layer only after you're comfortable with DeFi mechanics and have secured 3 months of expenses in the buffer.\n\nDocument your strategy: write down your goals, timeline, and risk tolerance. Review every 3 months.`,
          fr: `Vous disposez maintenant de tous les éléments pour créer votre première stratégie financière personnelle.\n\nLe Starter Stack SafeHaven :\n1. Tampon d'Urgence (20%) : USDC liquide, accessible en minutes\n2. Couche de Rendement Stable (50%) : Dépôt dans Kamino/MarginFi, 4-8% APY\n3. Couche de Croissance (30%) : Pools de liquidité avec paires stables (4-12% APY)\n\nCommencez de manière conservatrice : commencez avec les 2 premières couches seulement. Ajoutez la couche de croissance une fois à l'aise avec la DeFi.`,
          es: `Ahora tienes todos los elementos para crear tu primera estrategia financiera personal.\n\nEl Starter Stack de SafeHaven:\n1. Colchón de Emergencia (20%): USDC líquido, accesible en minutos\n2. Capa de Rendimiento Estable (50%): Depósito en Kamino/MarginFi, 4-8% APY\n3. Capa de Crecimiento (30%): Pools de liquidez con pares estables (4-12% APY)\n\nComienza de forma conservadora: empieza con solo las primeras 2 capas. Agrega la capa de crecimiento cuando te sientas cómodo con DeFi.`,
        },
        quiz: {
          question: { en: 'In the SafeHaven Starter Stack, what is the emergency buffer for?', fr: 'Dans le Starter Stack SafeHaven, à quoi sert le tampon d\'urgence ?', es: 'En el Starter Stack de SafeHaven, ¿para qué sirve el colchón de emergencia?' },
          options: [
            { en: 'To invest in high-risk DeFi opportunities immediately', fr: 'Pour investir immédiatement dans des opportunités DeFi à haut risque', es: 'Para invertir inmediatamente en oportunidades DeFi de alto riesgo' },
            { en: 'To provide liquid, zero-risk funds accessible within minutes for real emergencies', fr: 'Pour fournir des fonds liquides, sans risque, accessibles en minutes pour les vraies urgences', es: 'Para proporcionar fondos líquidos, de cero riesgo, accesibles en minutos para emergencias reales' },
            { en: 'To speculate on new token launches', fr: 'Pour spéculer sur les nouveaux lancements de tokens', es: 'Para especular sobre nuevos lanzamientos de tokens' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w5l4',
        title: { en: 'Risk Management', fr: 'Gestion des Risques', es: 'Gestión de Riesgos' },
        xp: 200,
        content: {
          en: `Risk management is the practice of identifying, assessing, and controlling threats to your financial goals. In crypto and DeFi, risk is ever-present — but manageable.\n\nTypes of risk in DeFi:\n- Smart contract risk: bugs in code can lead to loss of funds. Mitigate by using only audited protocols and spreading across multiple.\n- Liquidation risk: if you borrow against collateral, a price drop can trigger liquidation. Keep health factor above 1.5.\n- Bridge risk: cross-chain transfers involve additional smart contract exposure. Use established bridges.\n- Market risk: asset prices can drop sharply. Mitigate with stablecoins as your base layer.\n- Regulatory risk: DeFi regulations are evolving. Stay informed about your jurisdiction.\n\nThe diversification principle: spread your assets across multiple protocols, chains, and asset types. If one protocol is exploited, you don't lose everything.\n\nPosition sizing: never put more than 10-15% of your total savings into a single protocol, especially new or unaudited ones.\n\nRegular review: check your positions weekly. DeFi moves fast — protocols update, rates change, and risks evolve.\n\nThe risk-reward mindset: higher APY = higher risk. A 50% APY offer almost certainly involves significant risk. Sustainable DeFi yields on stablecoins are typically 3-12%. Be suspicious of anything much higher.`,
          fr: `La gestion des risques est la pratique d'identifier et contrôler les menaces pour vos objectifs financiers.\n\nTypes de risques en DeFi :\n- Risque de contrats intelligents : bugs pouvant entraîner des pertes\n- Risque de liquidation : baisse de prix pouvant déclencher une liquidation\n- Risque de bridge : exposition supplémentaire aux contrats\n- Risque de marché : chutes brutales des prix d'actifs\n- Risque réglementaire : évolution des régulations\n\nPrincipe de diversification : répartissez vos actifs. Ne mettez jamais plus de 10-15% dans un seul protocole.`,
          es: `La gestión de riesgos es la práctica de identificar y controlar amenazas a tus objetivos financieros.\n\nTipos de riesgo en DeFi:\n- Riesgo de contratos inteligentes: bugs que pueden causar pérdidas\n- Riesgo de liquidación: caída de precios que puede desencadenar liquidación\n- Riesgo de bridge: exposición adicional a contratos\n- Riesgo de mercado: caídas bruscas de precios de activos\n- Riesgo regulatorio: evolución de regulaciones\n\nPrincipio de diversificación: distribuye tus activos. Nunca pongas más del 10-15% en un solo protocolo.`,
        },
        quiz: {
          question: { en: 'A DeFi protocol offers 80% APY on stablecoins. What should this signal to you?', fr: 'Un protocole DeFi offre 80% APY sur des stablecoins. Que devriez-vous en déduire ?', es: 'Un protocolo DeFi ofrece 80% APY en stablecoins. ¿Qué debería señalarte esto?' },
          options: [
            { en: 'An excellent risk-free opportunity you should invest all your savings in', fr: 'Une excellente opportunité sans risque dans laquelle investir toutes vos économies', es: 'Una excelente oportunidad sin riesgo en la que deberías invertir todos tus ahorros' },
            { en: 'A warning sign — sustainable stablecoin yields are 3-12%; much higher likely means unsustainable risk', fr: 'Un signal d\'alarme — les rendements durables sur stablecoins sont 3-12%; bien plus élevé signifie probablement un risque insoutenable', es: 'Una señal de advertencia — los rendimientos sostenibles en stablecoins son 3-12%; mucho más alto probablemente significa riesgo insostenible' },
            { en: 'Normal DeFi behavior you should expect on all protocols', fr: 'Un comportement DeFi normal auquel vous devriez vous attendre sur tous les protocoles', es: 'Comportamiento DeFi normal que deberías esperar en todos los protocolos' },
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'w5boss',
        title: { en: '⚔️ Final Challenge', fr: '⚔️ Défi Final', es: '⚔️ Desafío Final' },
        xp: 500,
        isChallenge: true,
        content: {
          en: `The FINAL BOSS CHALLENGE — you've come so far!\n\nYou've completed all 5 worlds:\n🌍 World 1: Money Fundamentals — budgets, emergency funds\n🌍 World 2: Protect Your Money — inflation, USDC, debt\n🌍 World 3: Blockchain & Wallets — keys, security\n🌍 World 4: DeFi & Yields — lending, APY, Kamino\n🌍 World 5: Bridge & Grow — cross-chain, strategy, risk\n\nYou are now a SafeHaven-certified DeFi-aware financial thinker. You understand not just how to earn, but how to protect, grow, and safeguard your financial future.\n\nAnswer the final question to claim your 500 XP and reach the highest level — DeFi Master!`,
          fr: `LE DÉFI FINAL DU BOSS — vous êtes allé si loin !\n\nVous avez complété les 5 mondes. Vous êtes maintenant un penseur financier certifié SafeHaven, conscient de la DeFi. Répondez pour réclamer 500 XP et atteindre le niveau Maître DeFi !`,
          es: `¡EL DESAFÍO FINAL DEL JEFE — has llegado tan lejos!\n\nHas completado los 5 mundos. Ahora eres un pensador financiero certificado SafeHaven con conocimiento DeFi. ¡Responde para reclamar 500 XP y alcanzar el nivel Maestro DeFi!`,
        },
        quiz: {
          question: { en: 'Which combination represents the most complete approach to safe DeFi wealth building?', fr: 'Quelle combinaison représente l\'approche la plus complète pour construire de la richesse DeFi en sécurité ?', es: '¿Qué combinación representa el enfoque más completo para construir riqueza DeFi de forma segura?' },
          options: [
            { en: 'Chase highest APY, use unaudited protocols, bridge frequently without checking', fr: 'Chercher le plus haut APY, utiliser des protocoles non audités, bridge fréquemment sans vérifier', es: 'Perseguir el APY más alto, usar protocolos no auditados, bridgear frecuentemente sin verificar' },
            { en: 'Emergency fund + stable USDC yield + diversified protocols + active risk monitoring', fr: 'Fonds d\'urgence + rendement USDC stable + protocoles diversifiés + surveillance active des risques', es: 'Fondo de emergencia + rendimiento USDC estable + protocolos diversificados + monitoreo activo de riesgos' },
            { en: 'Hold only SOL and wait for price appreciation', fr: 'Détenir uniquement du SOL et attendre l\'appréciation des prix', es: 'Mantener solo SOL y esperar la apreciación del precio' },
          ],
          correctIndex: 1,
        },
      },
    ],
  },
];

export default COURSES;
