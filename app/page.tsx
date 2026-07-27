"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

const TOTAL_SLIDES = 6;
const MAX_STEPS = [0, 4, 3, 4, 5, 4];

type DeckState = {
  slide: number;
  steps: number[];
  overview: boolean;
  help: boolean;
  transitioning: boolean;
};

type DeckAction =
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "GO"; slide: number; step?: number }
  | { type: "OVERVIEW"; open: boolean }
  | { type: "HELP"; open: boolean }
  | { type: "UNLOCK" };

const slideTitles = [
  "Загрузка",
  "Банк как IT-система",
  "Где используется AI",
  "Анализ звонка",
  "Работа инженера",
  "Как начать",
];

function readHash(): Pick<DeckState, "slide" | "steps"> {
  if (typeof window === "undefined") {
    return { slide: 0, steps: [0, 0, 0, 0, 0, 0] };
  }

  const params = new URLSearchParams(window.location.hash.slice(1));
  const slide = Math.min(
    TOTAL_SLIDES - 1,
    Math.max(0, Number(params.get("slide") || 1) - 1),
  );
  const step = Math.min(
    MAX_STEPS[slide],
    Math.max(0, Number(params.get("step") || 0)),
  );
  const steps = [0, 0, 0, 0, 0, 0];
  steps[slide] = step;
  return { slide, steps };
}

function reducer(state: DeckState, action: DeckAction): DeckState {
  if (state.transitioning && action.type !== "UNLOCK") return state;

  switch (action.type) {
    case "NEXT": {
      const currentStep = state.steps[state.slide];
      if (currentStep < MAX_STEPS[state.slide]) {
        const steps = [...state.steps];
        steps[state.slide] = currentStep + 1;
        return { ...state, steps, transitioning: true };
      }
      if (state.slide < TOTAL_SLIDES - 1) {
        return { ...state, slide: state.slide + 1, transitioning: true };
      }
      return state;
    }
    case "PREVIOUS": {
      const currentStep = state.steps[state.slide];
      if (currentStep > 0) {
        const steps = [...state.steps];
        steps[state.slide] = currentStep - 1;
        return { ...state, steps, transitioning: true };
      }
      if (state.slide > 0) {
        return { ...state, slide: state.slide - 1, transitioning: true };
      }
      return state;
    }
    case "GO": {
      const steps = [...state.steps];
      steps[action.slide] = action.step ?? steps[action.slide] ?? 0;
      return {
        ...state,
        slide: action.slide,
        steps,
        overview: false,
        help: false,
        transitioning: true,
      };
    }
    case "OVERVIEW":
      return { ...state, overview: action.open, help: false };
    case "HELP":
      return { ...state, help: action.open, overview: false };
    case "UNLOCK":
      return { ...state, transitioning: false };
  }
}

function PixelIcon({ kind }: { kind: string }) {
  return <span className={`pixel-icon pixel-icon--${kind}`} aria-hidden="true" />;
}

function WindowFrame({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`window ${className}`}>
      <div className="window__titlebar">
        <span>{title}</span>
        <span className="window__controls" aria-hidden="true">
          <i />
          <i />
        </span>
      </div>
      <div className="window__body">{children}</div>
    </section>
  );
}

function BootScene({ step }: { step: number }) {
  return (
    <div className="scene scene--boot">
      <div className="boot__mark" aria-hidden="true">
        <span>AI</span>
      </div>
      <p className="eyebrow">AI_BANK_OS // EDUCATIONAL EDITION</p>
      <h1>AI В БАНКЕ</h1>
      <p className="boot__subtitle">
        Как технологии превращаются
        <br />в работающие системы
      </p>
      <div className={`boot__profile reveal ${step >= 0 ? "is-visible" : ""}`}>
        <span>Бауржан</span>
        <span>ML / AI-инженер</span>
      </div>
      <button className="boot__start" tabIndex={-1} aria-hidden="true">
        PRESS ENTER TO START <span className="terminal-cursor" />
      </button>
    </div>
  );
}

const bankSystems = [
  ["mobile", "Мобильное\nприложение"],
  ["payment", "Платежи"],
  ["data", "Данные"],
  ["shield", "Безопасность"],
  ["ai", "AI"],
];

function BankDesktopScene({ step }: { step: number }) {
  return (
    <div className="scene scene--bank">
      <SceneHeading
        eyebrow="02 // ВНУТРИ БАНКА"
        title="Банк сегодня — это IT-компания,"
        accent="которая работает с деньгами"
      />
      <div className="bank-map">
        <WindowFrame title="BANK_CORE.sys" className="bank-core">
          <div className="bank-building" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <strong>БАНК</strong>
          <small>миллионы операций</small>
        </WindowFrame>
        <div className="bank-systems">
          {bankSystems.map(([kind, label], index) => (
            <div
              className={`system-file ${index < Math.max(1, step + 1) ? "is-active" : ""}`}
              key={kind}
            >
              <PixelIcon kind={kind} />
              <span>
                {label.split("\n").map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AiToolsScene({ step }: { step: number }) {
  const tools = [
    {
      kind: "document",
      file: "documents.ai",
      copy: "документ → текст и нужные поля",
    },
    {
      kind: "call",
      file: "calls.ai",
      copy: "звонок → тема, проблема и результат",
    },
    {
      kind: "assistant",
      file: "assistant.ai",
      copy: "вопрос → поиск по инструкциям и ответ",
    },
  ];

  return (
    <div className="scene scene--tools">
      <SceneHeading
        eyebrow="03 // AI_TOOLS"
        title="AI помогает там,"
        accent="где вручную уже не справиться"
      />
      <WindowFrame title="C:\BANK\AI_TOOLS" className="folder-window">
        <div className="folder-grid">
          {tools.map((tool, index) => (
            <div
              className={`ai-file ${step >= index + 1 ? "is-visible" : ""} ${
                step === 3 && index === 1 ? "is-selected" : ""
              }`}
              key={tool.file}
            >
              <PixelIcon kind={tool.kind} />
              <strong>{tool.file}</strong>
              <span>{tool.copy}</span>
            </div>
          ))}
        </div>
        <div className="folder-status">
          {step < 3 ? "3 объекта" : "Открытие calls.ai…"}
        </div>
      </WindowFrame>
    </div>
  );
}

const waveform = [
  16, 36, 24, 52, 72, 34, 86, 48, 28, 64, 92, 42, 68, 30, 78, 54, 22, 62,
  46, 80, 32, 56, 18, 40,
];

function CallAnalyzerScene({ step }: { step: number }) {
  return (
    <div className="scene scene--call">
      <SceneHeading
        eyebrow="04 // CALL_ANALYZER"
        title="Один разговор превращается"
        accent="в данные для решения"
      />
      <div className="call-layout">
        <WindowFrame title="demo_call_004.wav" className="audio-window">
          <div className="audio-meta">
            <span>00:18</span>
            <span>LOCAL DEMO</span>
          </div>
          <div className={`waveform ${step >= 1 ? "is-playing" : ""}`}>
            {waveform.map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="audio-track">
            <span style={{ width: `${step >= 1 ? 64 : 0}%` }} />
          </div>
        </WindowFrame>

        <WindowFrame
          title="transcript.txt"
          className={`transcript-window reveal ${step >= 2 ? "is-visible" : ""}`}
        >
          <p>
            «Я пытался перевести деньги, но приложение показало ошибку.
            Поддержка ответила только через час».
          </p>
        </WindowFrame>

        <WindowFrame
          title="analysis.result"
          className={`analysis-window reveal ${step >= 3 ? "is-visible" : ""}`}
        >
          <dl>
            <div>
              <dt>ТЕМА</dt>
              <dd>перевод денег</dd>
            </div>
            <div>
              <dt>ПРОБЛЕМА</dt>
              <dd>техническая ошибка</dd>
            </div>
            <div>
              <dt>ТОНАЛЬНОСТЬ</dt>
              <dd>недовольство</dd>
            </div>
            <div>
              <dt>РЕЗУЛЬТАТ</dt>
              <dd>требуется помощь</dd>
            </div>
          </dl>
        </WindowFrame>
      </div>
      <div className={`insight-dialog reveal ${step >= 4 ? "is-visible" : ""}`}>
        <span className="insight-dialog__count">1000×</span>
        <p>
          разговоры → повторяющиеся проблемы
          <strong>→ решения для бизнеса</strong>
        </p>
      </div>
    </div>
  );
}

const pipeline = [
  ["problem", "Проблема", "понять задачу"],
  ["data", "Данные", "собрать и проверить"],
  ["model", "Модель", "выбрать и оценить"],
  ["service", "Сервис", "встроить в продукт"],
  ["monitor", "Мониторинг", "следить за качеством"],
];

function EngineerWorkspaceScene({ step }: { step: number }) {
  return (
    <div className="scene scene--engineer">
      <SceneHeading
        eyebrow="05 // ENGINEER_WORKSPACE"
        title="Модель — только одна часть"
        accent="AI-системы"
      />
      <div className="pipeline">
        {pipeline.map(([kind, title, copy], index) => (
          <div className="pipeline__item" key={title}>
            <div className={`pipeline__node ${step >= index + 1 ? "is-active" : ""}`}>
              <PixelIcon kind={kind} />
              <strong>{title}</strong>
              <span>{copy}</span>
            </div>
            {index < pipeline.length - 1 && (
              <span className="pipeline__arrow" aria-hidden="true">
                →
              </span>
            )}
          </div>
        ))}
      </div>
      <WindowFrame title="toolbox" className="toolbox-window">
        <div>
          <span>PY</span> Python
        </div>
        <div>
          <span>SQL</span> Данные
        </div>
        <div>
          <span>API</span> Интеграции
        </div>
        <div>
          <span>BOX</span> Docker
        </div>
      </WindowFrame>
    </div>
  );
}

const learningSteps = [
  "Изучи основы Python",
  "Научись работать с данными",
  "Сделай маленький проект",
  "Переходи к ML и AI",
];

function StartWizardScene({ step }: { step: number }) {
  return (
    <div className="scene scene--wizard">
      <SceneHeading
        eyebrow="06 // NEW_PROJECT_WIZARD"
        title="Начни с маленькой проблемы —"
        accent="и собери работающий проект"
      />
      <div className="wizard-layout">
        <WindowFrame title="Создание первого AI-проекта" className="wizard-window">
          <p className="wizard-window__label">Путь инженера</p>
          <ol>
            {learningSteps.map((item, index) => (
              <li className={step >= index + 1 ? "is-active" : ""} key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
                <i aria-hidden="true">{step >= index + 1 ? "OK" : "—"}</i>
              </li>
            ))}
          </ol>
        </WindowFrame>
        <WindowFrame title="IDEAS" className="ideas-window">
          <p>Папка с идеями</p>
          <ul>
            <li>анализ отзывов</li>
            <li>распознавание текста</li>
            <li>классификация сообщений</li>
            <li>простой AI-бот</li>
          </ul>
        </WindowFrame>
      </div>
      <div className={`final-message reveal ${step >= 4 ? "is-visible" : ""}`}>
        <p>
          AI — это инструмент. Самое важное — понимать,
          <strong>какую проблему ты хочешь решить.</strong>
        </p>
        <div className="question-dialog">
          <span>Есть вопросы?</span>
          <button tabIndex={-1}>ДА</button>
        </div>
      </div>
    </div>
  );
}

function SceneHeading({
  eyebrow,
  title,
  accent,
}: {
  eyebrow: string;
  title: string;
  accent: string;
}) {
  return (
    <header className="scene-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>
        {title}
        <span>{accent}</span>
      </h1>
    </header>
  );
}

function Slide({
  slide,
  step,
}: {
  slide: number;
  step: number;
}) {
  const scenes = [
    <BootScene step={step} key="boot" />,
    <BankDesktopScene step={step} key="bank" />,
    <AiToolsScene step={step} key="tools" />,
    <CallAnalyzerScene step={step} key="call" />,
    <EngineerWorkspaceScene step={step} key="engineer" />,
    <StartWizardScene step={step} key="wizard" />,
  ];
  return scenes[slide];
}

function Overview({
  activeSlide,
  onSelect,
  onClose,
}: {
  activeSlide: number;
  onSelect: (slide: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Обзор сцен">
      <div className="overlay__bar">
        <strong>ОБЗОР СИСТЕМЫ</strong>
        <button onClick={onClose} aria-label="Закрыть обзор">
          ×
        </button>
      </div>
      <div className="overview-grid">
        {slideTitles.map((title, index) => (
          <button
            className={index === activeSlide ? "is-active" : ""}
            onClick={() => onSelect(index)}
            key={title}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <PixelIcon
              kind={["boot", "bank", "folder", "call", "model", "project"][index]}
            />
            <strong>{title}</strong>
          </button>
        ))}
      </div>
      <p className="overlay__hint">Выберите сцену · Esc — закрыть</p>
    </div>
  );
}

function Help({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    ["→ / Space", "следующий шаг"],
    ["← / Backspace", "назад"],
    ["Home / End", "первая / последняя сцена"],
    ["O", "обзор сцен"],
    ["F", "полный экран"],
    ["Esc", "закрыть окно"],
  ];
  return (
    <div className="overlay overlay--help" role="dialog" aria-modal="true">
      <WindowFrame title="KEYBOARD_HELP.txt">
        <h2>Управление</h2>
        <dl>
          {shortcuts.map(([key, action]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>
        <button onClick={onClose}>ПОНЯТНО</button>
      </WindowFrame>
    </div>
  );
}

export default function Home() {
  const hashState = useMemo(readHash, []);
  const [state, dispatch] = useReducer(reducer, {
    ...hashState,
    overview: false,
    help: false,
    transitioning: false,
  });
  const headingRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      () => dispatch({ type: "UNLOCK" }),
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300,
    );
    return () => window.clearTimeout(timer);
  }, [state.slide, state.steps]);

  useEffect(() => {
    const step = state.steps[state.slide];
    window.history.replaceState(
      null,
      "",
      `#slide=${state.slide + 1}&step=${step}`,
    );
    headingRef.current?.focus({ preventScroll: true });
  }, [state.slide, state.steps]);

  useEffect(() => {
    const onHashChange = () => {
      const next = readHash();
      dispatch({
        type: "GO",
        slide: next.slide,
        step: next.steps[next.slide],
      });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (event.key === "Escape") {
        dispatch({ type: "OVERVIEW", open: false });
        dispatch({ type: "HELP", open: false });
        return;
      }
      if (state.overview || state.help) return;

      const forward = ["ArrowRight", "ArrowDown", " ", "PageDown", "Enter"];
      const backward = ["ArrowLeft", "ArrowUp", "Backspace", "PageUp"];

      if (forward.includes(event.key)) {
        event.preventDefault();
        dispatch({ type: "NEXT" });
      } else if (backward.includes(event.key)) {
        event.preventDefault();
        dispatch({ type: "PREVIOUS" });
      } else if (event.key === "Home") {
        event.preventDefault();
        dispatch({ type: "GO", slide: 0, step: 0 });
      } else if (event.key === "End") {
        event.preventDefault();
        dispatch({ type: "GO", slide: TOTAL_SLIDES - 1, step: 0 });
      } else if (event.key.toLowerCase() === "o") {
        dispatch({ type: "OVERVIEW", open: true });
      } else if (event.key.toLowerCase() === "f") {
        toggleFullscreen();
      } else if (event.key === "?") {
        dispatch({ type: "HELP", open: true });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.help, state.overview, toggleFullscreen]);

  return (
    <main className="presentation-shell">
      <div className="desktop-frame desktop-deck">
        <header className="menu-bar">
          <div className="menu-bar__brand">
            <span className="brand-chip" aria-hidden="true">
              AI
            </span>
            <strong>AI_BANK_OS</strong>
          </div>
          <nav aria-label="Системное меню">
            <button onClick={() => dispatch({ type: "OVERVIEW", open: true })}>
              ОБЗОР
            </button>
            <button onClick={() => dispatch({ type: "HELP", open: true })}>
              ПОМОЩЬ
            </button>
          </nav>
          <span className="menu-bar__edition">EDUCATIONAL DEMO</span>
        </header>

        <div
          className="slide-viewport"
          ref={headingRef}
          tabIndex={-1}
          role="group"
          aria-label={`Слайд ${state.slide + 1} из ${TOTAL_SLIDES}: ${slideTitles[state.slide]}`}
        >
          <Slide slide={state.slide} step={state.steps[state.slide]} />
        </div>

        <footer className="status-bar">
          <button
            className="status-button"
            onClick={() => dispatch({ type: "PREVIOUS" })}
            disabled={state.slide === 0 && state.steps[0] === 0}
            aria-label="Назад"
          >
            ←
          </button>
          <button
            className="status-button status-button--overview"
            onClick={() => dispatch({ type: "OVERVIEW", open: true })}
          >
            ОБЗОР
          </button>
          <div className="progress" aria-label={`Слайд ${state.slide + 1} из 6`}>
            <span className="progress__number">
              {String(state.slide + 1).padStart(2, "0")}
              <i>/</i>06
            </span>
            <div className="progress__track">
              <span
                style={{ width: `${((state.slide + 1) / TOTAL_SLIDES) * 100}%` }}
              />
            </div>
          </div>
          <button
            className="status-button status-button--fullscreen"
            onClick={toggleFullscreen}
            aria-label="Полный экран"
          >
            <span aria-hidden="true">□</span> ЭКРАН
          </button>
          <button
            className="status-button"
            onClick={() => dispatch({ type: "NEXT" })}
            disabled={
              state.slide === TOTAL_SLIDES - 1 &&
              state.steps[state.slide] === MAX_STEPS[state.slide]
            }
            aria-label="Далее"
          >
            →
          </button>
        </footer>

        {state.overview && (
          <Overview
            activeSlide={state.slide}
            onSelect={(slide) => dispatch({ type: "GO", slide, step: 0 })}
            onClose={() => dispatch({ type: "OVERVIEW", open: false })}
          />
        )}
        {state.help && (
          <Help onClose={() => dispatch({ type: "HELP", open: false })} />
        )}
      </div>
      <div className="mobile-reader">
        <header className="mobile-reader__header">
          <span className="brand-chip" aria-hidden="true">
            AI
          </span>
          <div>
            <strong>AI_BANK_OS</strong>
            <small>мобильная версия</small>
          </div>
        </header>
        <nav className="mobile-reader__nav" aria-label="Содержание">
          {slideTitles.map((title, index) => (
            <a href={`#reader-${index + 1}`} key={title}>
              {String(index + 1).padStart(2, "0")} {title}
            </a>
          ))}
        </nav>
        {slideTitles.map((title, index) => (
          <article
            className="mobile-reader__scene"
            id={`reader-${index + 1}`}
            aria-label={`Раздел ${index + 1}: ${title}`}
            key={title}
          >
            <Slide slide={index} step={MAX_STEPS[index]} />
          </article>
        ))}
        <footer className="mobile-reader__footer">
          AI_BANK_OS · EDUCATIONAL DEMO
        </footer>
      </div>
      <div className="sr-only" aria-live="polite">
        Слайд {state.slide + 1} из 6. {slideTitles[state.slide]}. Шаг{" "}
        {state.steps[state.slide]}.
      </div>
    </main>
  );
}
