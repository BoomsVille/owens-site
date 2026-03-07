"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type GameId = "snake" | "pong" | "breakout" | "tetris" | "invaders" | "asteroids";
type ScreenMode = "menu" | "playing";
type Difficulty = "easy" | "normal" | "hard";
type ArrowKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

type Vec2 = { x: number; y: number };

type SnakeState = {
  body: Vec2[];
  dir: Vec2;
  nextDir: Vec2;
  food: Vec2;
  timer: number;
  stepMs: number;
  score: number;
  level: number;
  over: boolean;
  won: boolean;
};

type PongState = {
  leftY: number;
  rightY: number;
  ball: Vec2;
  vel: Vec2;
  scoreL: number;
  scoreR: number;
  level: number;
  rallyHits: number;
};

type BreakoutState = {
  paddleX: number;
  ball: Vec2;
  vel: Vec2;
  bricks: boolean[][];
  score: number;
  level: number;
  lives: number;
  over: boolean;
  won: boolean;
};

type TetrisPiece = {
  x: number;
  y: number;
  shape: number[][];
  color: number;
};

type TetrisState = {
  board: number[][];
  active: TetrisPiece;
  timer: number;
  speed: number;
  score: number;
  level: number;
  over: boolean;
  won: boolean;
};

type InvaderEnemy = { x: number; y: number; w: number; h: number; alive: boolean };
type Shot = { x: number; y: number; vx: number; vy: number; friendly: boolean };

type InvaderState = {
  playerX: number;
  enemies: InvaderEnemy[];
  shots: Shot[];
  dir: number;
  score: number;
  level: number;
  lives: number;
  over: boolean;
  timer: number;
  won: boolean;
};

type Asteroid = { x: number; y: number; r: number; vx: number; vy: number; hp: number };

type AsteroidsState = {
  shipPos: Vec2;
  shipVel: Vec2;
  angle: number;
  bullets: Shot[];
  rocks: Asteroid[];
  score: number;
  level: number;
  lives: number;
  over: boolean;
  shootCooldown: number;
  won: boolean;
};

type RuntimeState = {
  mode: ScreenMode;
  menuIndex: number;
  difficulty: Difficulty;
  activeGame: GameId | null;
  snake: SnakeState;
  pong: PongState;
  breakout: BreakoutState;
  tetris: TetrisState;
  invaders: InvaderState;
  asteroids: AsteroidsState;
};

const WIDTH = 480;
const HEIGHT = 320;
const DIFFICULTY_OPTIONS: Difficulty[] = ["easy", "normal", "hard"];
const MENU_ITEMS: { id: GameId; label: string }[] = [
  { id: "snake", label: "SNAKE" },
  { id: "pong", label: "PONG" },
  { id: "breakout", label: "BREAKOUT" },
  { id: "tetris", label: "TETRIS STYLE" },
  { id: "invaders", label: "SPACE INVADERS" },
  { id: "asteroids", label: "ASTEROIDS" }
];

const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  {
    snakeStep: number;
    pongBall: number;
    pongAi: number;
    breakoutBall: number;
    breakoutPaddle: number;
    breakoutLives: number;
    tetrisDrop: number;
    invaderMove: number;
    invaderShotRate: number;
    invaderLives: number;
    asteroidCount: number;
    asteroidSpeed: number;
    asteroidShootCd: number;
    asteroidThrust: number;
    asteroidLives: number;
  }
> = {
  easy: {
    snakeStep: 120,
    pongBall: 0.85,
    pongAi: 0.75,
    breakoutBall: 0.86,
    breakoutPaddle: 1.2,
    breakoutLives: 4,
    tetrisDrop: 560,
    invaderMove: 0.75,
    invaderShotRate: 0.65,
    invaderLives: 4,
    asteroidCount: 4,
    asteroidSpeed: 0.72,
    asteroidShootCd: 240,
    asteroidThrust: 1.12,
    asteroidLives: 4
  },
  normal: {
    snakeStep: 95,
    pongBall: 1,
    pongAi: 1,
    breakoutBall: 1,
    breakoutPaddle: 1,
    breakoutLives: 3,
    tetrisDrop: 450,
    invaderMove: 1,
    invaderShotRate: 1,
    invaderLives: 3,
    asteroidCount: 6,
    asteroidSpeed: 1,
    asteroidShootCd: 180,
    asteroidThrust: 1,
    asteroidLives: 3
  },
  hard: {
    snakeStep: 74,
    pongBall: 1.24,
    pongAi: 1.3,
    breakoutBall: 1.25,
    breakoutPaddle: 0.82,
    breakoutLives: 2,
    tetrisDrop: 320,
    invaderMove: 1.35,
    invaderShotRate: 1.5,
    invaderLives: 2,
    asteroidCount: 9,
    asteroidSpeed: 1.35,
    asteroidShootCd: 120,
    asteroidThrust: 0.9,
    asteroidLives: 2
  }
};

const TETROMINOS: number[][][] = [
  [[1, 1, 1, 1]],
  [
    [1, 0, 0],
    [1, 1, 1]
  ],
  [
    [0, 0, 1],
    [1, 1, 1]
  ],
  [
    [1, 1],
    [1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ]
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const randomFood = (snakeBody: Vec2[]): Vec2 => {
  while (true) {
    const food = { x: Math.floor(rand(1, 29)), y: Math.floor(rand(1, 19)) };
    if (!snakeBody.some((p) => p.x === food.x && p.y === food.y)) return food;
  }
};

const rotateShape = (shape: number[][]): number[][] => {
  const h = shape.length;
  const w = shape[0].length;
  const rotated: number[][] = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      rotated[x][h - y - 1] = shape[y][x];
    }
  }
  return rotated;
};

const createTetrisPiece = (): TetrisPiece => {
  const index = Math.floor(Math.random() * TETROMINOS.length);
  const shape = TETROMINOS[index];
  return {
    x: 4,
    y: 0,
    shape,
    color: index + 1
  };
};

const MAX_LEVEL = 5;

const createBreakoutBricks = (level = 1) => {
  const rows = Math.min(5, 2 + level);
  const cols = 9;
  return Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 10 }, (_, col) => row < rows && col < cols)
  );
};

const createInvaderWave = (level = 1): InvaderEnemy[] => {
  const invaders: InvaderEnemy[] = [];
  const rows = Math.min(5, 3 + Math.floor((level + 1) / 2));
  const cols = 9;
  const yOffset = 36 - (level - 1) * 2;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      invaders.push({ x: 62 + col * 38, y: yOffset + row * 26, w: 24, h: 14, alive: true });
    }
  }
  return invaders;
};

const createAsteroidField = (count: number, speed: number): Asteroid[] =>
  Array.from({ length: count }, () => ({
    x: rand(20, WIDTH - 20),
    y: rand(20, HEIGHT - 20),
    r: rand(14, 26),
    vx: rand(-0.8, 0.8) * speed,
    vy: rand(-0.8, 0.8) * speed,
    hp: 2
  }));

const createRuntime = (difficulty: Difficulty = "normal"): RuntimeState => {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const snakeBody = [
    { x: 14, y: 10 },
    { x: 13, y: 10 },
    { x: 12, y: 10 }
  ];

  const invaders = createInvaderWave(1);
  const asteroids = createAsteroidField(settings.asteroidCount, settings.asteroidSpeed);

  return {
    mode: "menu",
    menuIndex: 0,
    difficulty,
    activeGame: null,
    snake: {
      body: snakeBody,
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: randomFood(snakeBody),
      timer: 0,
      stepMs: settings.snakeStep,
      score: 0,
      level: 1,
      over: false,
      won: false
    },
    pong: {
      leftY: HEIGHT / 2 - 32,
      rightY: HEIGHT / 2 - 32,
      ball: { x: WIDTH / 2, y: HEIGHT / 2 },
      vel: { x: 2.4 * settings.pongBall, y: 1.6 * settings.pongBall },
      scoreL: 0,
      scoreR: 0,
      level: 1,
      rallyHits: 0
    },
    breakout: {
      paddleX: WIDTH / 2 - 36,
      ball: { x: WIDTH / 2, y: HEIGHT - 60 },
      vel: { x: 2.2 * settings.breakoutBall, y: -2.5 * settings.breakoutBall },
      bricks: createBreakoutBricks(1),
      score: 0,
      level: 1,
      lives: settings.breakoutLives,
      over: false,
      won: false
    },
    tetris: {
      board: Array.from({ length: 20 }, () => Array(10).fill(0)),
      active: createTetrisPiece(),
      timer: 0,
      speed: settings.tetrisDrop,
      score: 0,
      level: 1,
      over: false,
      won: false
    },
    invaders: {
      playerX: WIDTH / 2 - 15,
      enemies: invaders,
      shots: [],
      dir: 1,
      score: 0,
      level: 1,
      lives: settings.invaderLives,
      over: false,
      timer: 0,
      won: false
    },
    asteroids: {
      shipPos: { x: WIDTH / 2, y: HEIGHT / 2 },
      shipVel: { x: 0, y: 0 },
      angle: -Math.PI / 2,
      bullets: [],
      rocks: asteroids,
      score: 0,
      level: 1,
      lives: settings.asteroidLives,
      over: false,
      shootCooldown: settings.asteroidShootCd * 0.4,
      won: false
    }
  };
};

export function RetroTvGalaga() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const runtimeRef = useRef<RuntimeState>(createRuntime("normal"));
  const gestureStartRef = useRef<Vec2 | null>(null);
  const joystickPointerIdRef = useRef<number | null>(null);
  const joystickDirectionRef = useRef<ArrowKey | null>(null);
  const [menuIndex, setMenuIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [mode, setMode] = useState<ScreenMode>("menu");
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [isMobileControls, setIsMobileControls] = useState(false);
  const [joystickKnob, setJoystickKnob] = useState({ x: 0, y: 0 });
  const [statusText, setStatusText] = useState("Use arrows + Enter to launch. Left/Right changes difficulty.");
  const actionAriaLabel =
    mode === "menu" ? "Start" : activeGame === "tetris" ? "Rotate" : activeGame === "invaders" || activeGame === "asteroids" ? "Fire" : "Action";
  const gameplayHint =
    mode === "menu"
      ? "Menu: ↑/↓ select game, ←/→ difficulty, Start/Enter launch."
      : activeGame === "tetris"
        ? "Tetris: ←/→ move, ↓ soft drop, Rotate button or tap/swipe up to rotate."
        : activeGame === "pong"
          ? "Pong: ↑/↓ move paddle. Rally speed increases per hit."
          : activeGame === "breakout"
            ? "Breakout: ←/→ move paddle, keep the ball alive through all levels."
            : activeGame === "snake"
              ? "Snake: use D-pad to steer and avoid walls/self."
              : activeGame === "invaders"
                ? "Invaders: ←/→ move, Action to fire, clear all waves."
                : "Asteroids: ←/→ rotate, ↑ thrust, Action to fire.";

  const tapKey = (key: string) => {
    handleInputKeyDown(key);
    window.setTimeout(() => handleInputKeyUp(key), 0);
  };

  const handleActionPress = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (runtimeRef.current.mode === "menu") {
      tapKey("Enter");
      return;
    }
    if (runtimeRef.current.activeGame === "tetris") {
      tapKey("ArrowUp");
      return;
    }
    handleInputKeyDown(" ");
  };

  const handleActionRelease = () => {
    if (runtimeRef.current.activeGame !== "tetris") handleInputKeyUp(" ");
  };

  const drawMenu = (ctx: CanvasRenderingContext2D, currentIndex: number, currentDifficulty: Difficulty) => {
    ctx.fillStyle = "#020706";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (let y = 0; y < HEIGHT; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? "rgba(30, 120, 95, 0.08)" : "rgba(20, 100, 80, 0.03)";
      ctx.fillRect(0, y, WIDTH, 1);
    }

    ctx.fillStyle = "#4fe0bd";
    ctx.font = "700 28px monospace";
    ctx.textAlign = "center";
    ctx.fillText("RETRO GAME MENU", WIDTH / 2, 52);

    ctx.font = "600 12px monospace";
    ctx.fillStyle = "#86c8ff";
    ctx.fillText("DIFFICULTY", WIDTH / 2, 74);

    DIFFICULTY_OPTIONS.forEach((option, idx) => {
      const x = 145 + idx * 92;
      const active = option === currentDifficulty;
      if (active) {
        ctx.fillStyle = "rgba(110, 230, 198, 0.22)";
        ctx.fillRect(x - 40, 82, 80, 22);
      }
      ctx.fillStyle = active ? "#b8ffef" : "#73bcd9";
      ctx.fillText(option.toUpperCase(), x, 97);
    });

    ctx.font = "600 16px monospace";
    MENU_ITEMS.forEach((item, idx) => {
      const y = 128 + idx * 30;
      const isActive = idx === currentIndex;
      if (isActive) {
        ctx.fillStyle = "rgba(110, 230, 198, 0.2)";
        ctx.fillRect(118, y - 18, 244, 24);
      }
      ctx.fillStyle = isActive ? "#9ef2dd" : "#62cdb2";
      ctx.fillText(`${isActive ? ">" : " "} ${item.label}`, WIDTH / 2, y);
    });

    ctx.fillStyle = "#6ea9ff";
    ctx.font = "500 12px monospace";
    ctx.fillText("UP/DOWN GAME | LEFT/RIGHT DIFFICULTY | ENTER OR CLICK START", WIDTH / 2, HEIGHT - 20);
  };

  const launchGame = (gameId: GameId) => {
    const runtime = createRuntime(runtimeRef.current.difficulty);
    runtime.mode = "playing";
    runtime.activeGame = gameId;
    runtimeRef.current = runtime;
    setMode("playing");
    setActiveGame(gameId);
    setDifficulty(runtime.difficulty);
    setStatusText(`Press ESC to return to menu (${runtime.difficulty.toUpperCase()})`);
  };

  const resetToMenu = () => {
    const runtime = createRuntime(runtimeRef.current.difficulty);
    runtimeRef.current = runtime;
    setMode("menu");
    setActiveGame(null);
    setDifficulty(runtime.difficulty);
    setMenuIndex(runtime.menuIndex);
    setStatusText("Use arrows + Enter to launch. Left/Right changes difficulty.");
  };

  const handleInputKeyDown = (key: string) => {
    const normalized = key.toLowerCase();
    keysRef.current[normalized] = true;

    if (runtimeRef.current.mode === "menu") {
      if (key === "ArrowUp") {
        runtimeRef.current.menuIndex = (runtimeRef.current.menuIndex + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
        setMenuIndex(runtimeRef.current.menuIndex);
      }
      if (key === "ArrowDown") {
        runtimeRef.current.menuIndex = (runtimeRef.current.menuIndex + 1) % MENU_ITEMS.length;
        setMenuIndex(runtimeRef.current.menuIndex);
      }
      if (key === "ArrowLeft" || key === "ArrowRight") {
        const current = DIFFICULTY_OPTIONS.indexOf(runtimeRef.current.difficulty);
        const delta = key === "ArrowLeft" ? -1 : 1;
        const next = (current + delta + DIFFICULTY_OPTIONS.length) % DIFFICULTY_OPTIONS.length;
        runtimeRef.current.difficulty = DIFFICULTY_OPTIONS[next];
        setDifficulty(runtimeRef.current.difficulty);
      }
      if (key === "Enter") {
        launchGame(MENU_ITEMS[runtimeRef.current.menuIndex].id);
      }
    } else if (runtimeRef.current.mode === "playing" && key === "Escape") {
      resetToMenu();
    }
  };

  const handleInputKeyUp = (key: string) => {
    keysRef.current[key.toLowerCase()] = false;
  };

  const setJoystickDirection = (nextDirection: ArrowKey | null) => {
    const currentDirection = joystickDirectionRef.current;
    if (currentDirection === nextDirection) return;
    if (currentDirection) handleInputKeyUp(currentDirection);
    if (nextDirection) handleInputKeyDown(nextDirection);
    joystickDirectionRef.current = nextDirection;
  };

  const releaseJoystick = () => {
    setJoystickDirection(null);
    joystickPointerIdRef.current = null;
    setJoystickKnob({ x: 0, y: 0 });
  };

  const updateJoystickFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rawDx = event.clientX - cx;
    const rawDy = event.clientY - cy;
    const maxRadius = 46;
    const length = Math.hypot(rawDx, rawDy) || 1;
    const scale = Math.min(1, maxRadius / length);
    const dx = rawDx * scale;
    const dy = rawDy * scale;
    const deadZone = 12;

    setJoystickKnob({ x: dx, y: dy });

    if (Math.abs(dx) < deadZone && Math.abs(dy) < deadZone) {
      setJoystickDirection(null);
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      setJoystickDirection(dx > 0 ? "ArrowRight" : "ArrowLeft");
    } else {
      setJoystickDirection(dy > 0 ? "ArrowDown" : "ArrowUp");
    }
  };

  useEffect(() => {
    const detect = () => setIsMobileControls(window.matchMedia("(max-width: 640px), (pointer: coarse)").matches);
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  useEffect(() => {
    if (!isMobileControls) releaseJoystick();
  }, [isMobileControls]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape", " "].includes(event.key)) {
        event.preventDefault();
      }
      handleInputKeyDown(event.key);
    };

    const keyUp = (event: KeyboardEvent) => {
      handleInputKeyUp(event.key);
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const toCanvasCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const scaleY = HEIGHT / rect.height;
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const handleMenuHover = (clientX: number, clientY: number) => {
      const pos = toCanvasCoords(clientX, clientY);
      for (let i = 0; i < DIFFICULTY_OPTIONS.length; i += 1) {
        const x = 145 + i * 92;
        if (pos.x >= x - 40 && pos.x <= x + 40 && pos.y >= 82 && pos.y <= 104) {
          runtimeRef.current.difficulty = DIFFICULTY_OPTIONS[i];
          setDifficulty(runtimeRef.current.difficulty);
          break;
        }
      }
      for (let i = 0; i < MENU_ITEMS.length; i += 1) {
        const y = 128 + i * 30;
        if (pos.x >= 118 && pos.x <= 362 && pos.y >= y - 20 && pos.y <= y + 8) {
          runtimeRef.current.menuIndex = i;
          setMenuIndex(i);
          break;
        }
      }
    };

    const handleMenuActivate = (clientX: number, clientY: number) => {
      const pos = toCanvasCoords(clientX, clientY);
      for (let i = 0; i < DIFFICULTY_OPTIONS.length; i += 1) {
        const x = 145 + i * 92;
        if (pos.x >= x - 40 && pos.x <= x + 40 && pos.y >= 82 && pos.y <= 104) {
          runtimeRef.current.difficulty = DIFFICULTY_OPTIONS[i];
          setDifficulty(runtimeRef.current.difficulty);
          return;
        }
      }
      for (let i = 0; i < MENU_ITEMS.length; i += 1) {
        const y = 128 + i * 30;
        if (pos.x >= 118 && pos.x <= 362 && pos.y >= y - 20 && pos.y <= y + 8) {
          launchGame(MENU_ITEMS[i].id);
          break;
        }
      }
    };

    const pointerMove = (event: PointerEvent) => {
      if (runtimeRef.current.mode !== "menu") return;
      handleMenuHover(event.clientX, event.clientY);
    };

    const pointerDown = (event: PointerEvent) => {
      if (runtimeRef.current.mode !== "menu") {
        if (runtimeRef.current.activeGame === "tetris") {
          const pos = toCanvasCoords(event.clientX, event.clientY);
          gestureStartRef.current = { x: pos.x, y: pos.y };
        }
        return;
      }
      event.preventDefault();
      handleMenuActivate(event.clientX, event.clientY);
    };

    const pointerUp = (event: PointerEvent) => {
      if (runtimeRef.current.mode !== "playing" || runtimeRef.current.activeGame !== "tetris") return;
      const start = gestureStartRef.current;
      if (!start) return;
      const end = toCanvasCoords(event.clientX, event.clientY);
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const threshold = 18;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        tapKey(dx > 0 ? "ArrowRight" : "ArrowLeft");
      } else if (dy > threshold) {
        tapKey("ArrowDown");
      } else if (dy < -threshold) {
        tapKey("ArrowUp");
      } else {
        tapKey("ArrowUp");
      }
      gestureStartRef.current = null;
    };

    canvas.style.touchAction = "none";
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointerup", pointerUp);

    return () => {
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointerup", pointerUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    const collideRect = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    };

    const updateSnake = (delta: number) => {
      const st = runtimeRef.current.snake;
      if (st.over) return;
      const settings = DIFFICULTY_SETTINGS[runtimeRef.current.difficulty];

      if ((keysRef.current.arrowup || keysRef.current.w) && st.dir.y !== 1) st.nextDir = { x: 0, y: -1 };
      if ((keysRef.current.arrowdown || keysRef.current.s) && st.dir.y !== -1) st.nextDir = { x: 0, y: 1 };
      if ((keysRef.current.arrowleft || keysRef.current.a) && st.dir.x !== 1) st.nextDir = { x: -1, y: 0 };
      if ((keysRef.current.arrowright || keysRef.current.d) && st.dir.x !== -1) st.nextDir = { x: 1, y: 0 };

      st.timer += delta;
      const stepMs = settings.snakeStep * (1 - (st.level - 1) * 0.11);
      if (st.timer < stepMs) return;
      st.timer = 0;
      st.dir = st.nextDir;

      const head = { x: st.body[0].x + st.dir.x, y: st.body[0].y + st.dir.y };
      if (head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 20 || st.body.some((p) => p.x === head.x && p.y === head.y)) {
        st.over = true;
        setStatusText("Snake over - ESC for menu");
        return;
      }

      st.body.unshift(head);
      if (head.x === st.food.x && head.y === st.food.y) {
        st.score += 10;
        st.level = clamp(1 + Math.floor(st.score / 50), 1, MAX_LEVEL);
        st.food = randomFood(st.body);
      } else {
        st.body.pop();
      }
      if (st.level >= MAX_LEVEL && st.score >= 250) {
        st.over = true;
        st.won = true;
      }
      setStatusText(`Snake L${st.level} Score ${st.score} - ESC for menu`);
    };

    const drawSnake = () => {
      const st = runtimeRef.current.snake;
      const cell = 16;
      ctx.fillStyle = "#02080b";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = "rgba(100, 160, 240, 0.08)";
      for (let x = 0; x <= WIDTH; x += cell) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= HEIGHT; y += cell) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }

      ctx.fillStyle = "#7ce6d2";
      st.body.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? "#afeedd" : "#63ccb5";
        ctx.fillRect(p.x * cell + 1, p.y * cell + 1, cell - 2, cell - 2);
      });

      ctx.fillStyle = "#6ea9ff";
      ctx.fillRect(st.food.x * cell + 3, st.food.y * cell + 3, cell - 6, cell - 6);

      if (st.over) {
        ctx.fillStyle = "rgba(2, 8, 12, 0.75)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "#bde8ff";
        ctx.font = "700 28px monospace";
        ctx.textAlign = "center";
        ctx.fillText(st.won ? "SNAKE MASTERED" : "GAME OVER", WIDTH / 2, HEIGHT / 2);
      }
    };

    const updatePong = (delta: number) => {
      const st = runtimeRef.current.pong;
      const settings = DIFFICULTY_SETTINGS[runtimeRef.current.difficulty];
      const levelMult = 1 + (st.level - 1) * 0.11;
      const speed = delta * 0.28;
      if (keysRef.current.w || keysRef.current.arrowup) st.leftY -= speed;
      if (keysRef.current.s || keysRef.current.arrowdown) st.leftY += speed;
      st.leftY = clamp(st.leftY, 10, HEIGHT - 74);

      const aiError = 16 + (5 - st.level) * 3;
      const aiTarget = st.ball.y - 32 + Math.sin(st.ball.x * 0.03) * aiError;
      const aiDelta = aiTarget - st.rightY;
      const aiDeadZone = 8;
      if (Math.abs(aiDelta) > aiDeadZone) {
        st.rightY += clamp(aiDelta, -speed * 0.58 * settings.pongAi * levelMult, speed * 0.58 * settings.pongAi * levelMult);
      }
      st.rightY = clamp(st.rightY, 10, HEIGHT - 74);

      const rallyMult = 1 + Math.min(0.9, st.rallyHits * 0.045);
      st.ball.x += st.vel.x * settings.pongBall * levelMult * rallyMult;
      st.ball.y += st.vel.y * settings.pongBall * levelMult * rallyMult;
      if (st.ball.y < 8 || st.ball.y > HEIGHT - 8) st.vel.y *= -1;

      const leftPaddle = { x: 18, y: st.leftY, w: 10, h: 64 };
      const rightPaddle = { x: WIDTH - 28, y: st.rightY, w: 10, h: 64 };
      const ballRect = { x: st.ball.x - 6, y: st.ball.y - 6, w: 12, h: 12 };

      if (collideRect(ballRect, leftPaddle) && st.vel.x < 0) {
        st.vel.x *= -1;
        st.vel.y += (st.ball.y - (st.leftY + 32)) * 0.02;
        st.rallyHits += 1;
      }
      if (collideRect(ballRect, rightPaddle) && st.vel.x > 0) {
        st.vel.x *= -1;
        st.vel.y += (st.ball.y - (st.rightY + 32)) * 0.02;
        st.rallyHits += 1;
      }

      if (st.ball.x < -10) {
        st.scoreR += 1;
        st.ball = { x: WIDTH / 2, y: HEIGHT / 2 };
        st.vel = { x: 2.4 * settings.pongBall, y: rand(-2, 2) * settings.pongBall };
        st.rallyHits = 0;
      }
      if (st.ball.x > WIDTH + 10) {
        st.scoreL += 1;
        st.ball = { x: WIDTH / 2, y: HEIGHT / 2 };
        st.vel = { x: -2.4 * settings.pongBall, y: rand(-2, 2) * settings.pongBall };
        st.rallyHits = 0;
      }
      st.level = clamp(1 + Math.floor(Math.max(st.scoreL, st.scoreR) / 2), 1, MAX_LEVEL);
      setStatusText(`Pong L${st.level} ${st.scoreL} : ${st.scoreR} - ESC for menu`);
    };

    const drawPong = () => {
      const st = runtimeRef.current.pong;
      ctx.fillStyle = "#02070d";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = "rgba(120, 170, 255, 0.26)";
      ctx.setLineDash([5, 8]);
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 0);
      ctx.lineTo(WIDTH / 2, HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#89b6ff";
      ctx.fillRect(18, st.leftY, 10, 64);
      ctx.fillRect(WIDTH - 28, st.rightY, 10, 64);
      ctx.fillRect(st.ball.x - 6, st.ball.y - 6, 12, 12);

      ctx.fillStyle = "#d4e6ff";
      ctx.font = "700 30px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${st.scoreL}`, WIDTH / 2 - 48, 38);
      ctx.fillText(`${st.scoreR}`, WIDTH / 2 + 48, 38);
    };

    const updateBreakout = () => {
      const st = runtimeRef.current.breakout;
      if (st.over) return;
      const settings = DIFFICULTY_SETTINGS[runtimeRef.current.difficulty];
      const levelMult = 1 + (st.level - 1) * 0.1;

      if (keysRef.current.arrowleft || keysRef.current.a) st.paddleX -= 4.2 * settings.breakoutPaddle;
      if (keysRef.current.arrowright || keysRef.current.d) st.paddleX += 4.2 * settings.breakoutPaddle;
      st.paddleX = clamp(st.paddleX, 10, WIDTH - 82);

      st.ball.x += st.vel.x * settings.breakoutBall * levelMult;
      st.ball.y += st.vel.y * settings.breakoutBall * levelMult;

      if (st.ball.x < 8 || st.ball.x > WIDTH - 8) st.vel.x *= -1;
      if (st.ball.y < 8) st.vel.y *= -1;

      const paddleRect = { x: st.paddleX, y: HEIGHT - 26, w: 72, h: 10 };
      const ballRect = { x: st.ball.x - 5, y: st.ball.y - 5, w: 10, h: 10 };
      if (collideRect(ballRect, paddleRect) && st.vel.y > 0) {
        st.vel.y *= -1;
        st.vel.x += (st.ball.x - (st.paddleX + 36)) * 0.03;
      }

      const brickW = 44;
      const brickH = 14;
      for (let r = 0; r < st.bricks.length; r += 1) {
        for (let c = 0; c < st.bricks[r].length; c += 1) {
          if (!st.bricks[r][c]) continue;
          const brickRect = { x: 16 + c * (brickW + 4), y: 40 + r * (brickH + 4), w: brickW, h: brickH };
          if (collideRect(ballRect, brickRect)) {
            st.bricks[r][c] = false;
            st.vel.y *= -1;
            st.score += 20;
          }
        }
      }

      if (st.ball.y > HEIGHT + 12) {
        st.lives -= 1;
        st.ball = { x: WIDTH / 2, y: HEIGHT - 60 };
        st.vel = { x: rand(-2.2, 2.2) * settings.breakoutBall, y: -2.5 * settings.breakoutBall };
        if (st.lives <= 0) {
          st.over = true;
          setStatusText("Breakout over - ESC for menu");
          return;
        }
      }

      const remaining = st.bricks.flat().filter(Boolean).length;
      if (remaining === 0) {
        if (st.level < MAX_LEVEL) {
          st.level += 1;
          st.score += 150;
          st.bricks = createBreakoutBricks(st.level);
          st.ball = { x: WIDTH / 2, y: HEIGHT - 60 };
          st.vel = { x: rand(-2.2, 2.2) * settings.breakoutBall, y: -2.5 * settings.breakoutBall };
        } else {
          st.over = true;
          st.won = true;
          st.score += 300;
        }
      }
      setStatusText(`Breakout L${st.level} Score ${st.score} | Lives ${st.lives} - ESC for menu`);
    };

    const drawBreakout = () => {
      const st = runtimeRef.current.breakout;
      ctx.fillStyle = "#05070d";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const colors = ["#5ea4ff", "#76bcff", "#8cc9ff", "#73d6c6", "#9ce6d9"];
      const brickW = 44;
      const brickH = 14;

      for (let r = 0; r < st.bricks.length; r += 1) {
        for (let c = 0; c < st.bricks[r].length; c += 1) {
          if (!st.bricks[r][c]) continue;
          ctx.fillStyle = colors[r % colors.length];
          ctx.fillRect(16 + c * (brickW + 4), 40 + r * (brickH + 4), brickW, brickH);
        }
      }

      ctx.fillStyle = "#b4d2ff";
      ctx.fillRect(st.paddleX, HEIGHT - 26, 72, 10);
      ctx.fillRect(st.ball.x - 5, st.ball.y - 5, 10, 10);

      if (st.over) {
        ctx.fillStyle = "rgba(3,8,16,0.72)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "#d7e8ff";
        ctx.font = "700 26px monospace";
        ctx.textAlign = "center";
        ctx.fillText(st.won ? "BREAKOUT MASTERED" : "GAME OVER", WIDTH / 2, HEIGHT / 2);
      }
    };

    const canPlace = (board: number[][], piece: TetrisPiece, testX = piece.x, testY = piece.y, testShape = piece.shape) => {
      for (let y = 0; y < testShape.length; y += 1) {
        for (let x = 0; x < testShape[y].length; x += 1) {
          if (!testShape[y][x]) continue;
          const bx = testX + x;
          const by = testY + y;
          if (bx < 0 || bx >= 10 || by >= 20) return false;
          if (by >= 0 && board[by][bx]) return false;
        }
      }
      return true;
    };

    const lockPiece = (st: TetrisState) => {
      st.active.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (!value) return;
          const by = st.active.y + y;
          const bx = st.active.x + x;
          if (by >= 0 && by < 20 && bx >= 0 && bx < 10) st.board[by][bx] = st.active.color;
        });
      });

      let lines = 0;
      for (let y = 19; y >= 0; y -= 1) {
        if (st.board[y].every((cell) => cell !== 0)) {
          st.board.splice(y, 1);
          st.board.unshift(Array(10).fill(0));
          lines += 1;
          y += 1;
        }
      }
      if (lines > 0) st.score += lines * 100;
      st.level = clamp(1 + Math.floor(st.score / 300), 1, MAX_LEVEL);
      st.active = createTetrisPiece();
      if (!canPlace(st.board, st.active)) {
        st.over = true;
      }
    };

    const updateTetris = (delta: number) => {
      const st = runtimeRef.current.tetris;
      if (st.over) return;
      const settings = DIFFICULTY_SETTINGS[runtimeRef.current.difficulty];
      st.speed = Math.max(110, settings.tetrisDrop - (st.level - 1) * 55);

      if (keysRef.current.arrowleft && canPlace(st.board, st.active, st.active.x - 1, st.active.y)) {
        st.active.x -= 1;
        keysRef.current.arrowleft = false;
      }
      if (keysRef.current.arrowright && canPlace(st.board, st.active, st.active.x + 1, st.active.y)) {
        st.active.x += 1;
        keysRef.current.arrowright = false;
      }
      if (keysRef.current.arrowup) {
        const rotated = rotateShape(st.active.shape);
        if (canPlace(st.board, st.active, st.active.x, st.active.y, rotated)) st.active.shape = rotated;
        keysRef.current.arrowup = false;
      }

      const dropBoost = keysRef.current.arrowdown ? 3.2 : 1;
      st.timer += delta * dropBoost;
      if (st.timer >= st.speed) {
        st.timer = 0;
        if (canPlace(st.board, st.active, st.active.x, st.active.y + 1)) {
          st.active.y += 1;
        } else {
          lockPiece(st);
        }
      }

      if (st.level >= MAX_LEVEL && st.score >= 1500) {
        st.over = true;
        st.won = true;
      }
      setStatusText(`Tetris L${st.level} Score ${st.score} - ESC for menu`);
    };

    const drawTetris = () => {
      const st = runtimeRef.current.tetris;
      ctx.fillStyle = "#02060c";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const ox = 140;
      const oy = 16;
      const cell = 14;
      const colors = ["#000", "#6fa8ff", "#8fd9ff", "#5fd0be", "#d6e8ff", "#88c4ff", "#a7deff", "#77a7f6"];

      ctx.fillStyle = "#0f1d34";
      ctx.fillRect(ox - 8, oy - 8, 10 * cell + 16, 20 * cell + 16);

      for (let y = 0; y < 20; y += 1) {
        for (let x = 0; x < 10; x += 1) {
          const val = st.board[y][x];
          ctx.fillStyle = val ? colors[val] : "#091122";
          ctx.fillRect(ox + x * cell, oy + y * cell, cell - 1, cell - 1);
        }
      }

      st.active.shape.forEach((row, y) => {
        row.forEach((v, x) => {
          if (!v) return;
          ctx.fillStyle = colors[st.active.color] || "#8fc9ff";
          ctx.fillRect(ox + (st.active.x + x) * cell, oy + (st.active.y + y) * cell, cell - 1, cell - 1);
        });
      });

      if (st.over) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "#d7e8ff";
        ctx.font = "700 26px monospace";
        ctx.textAlign = "center";
        ctx.fillText(st.won ? "TETRIS MASTERED" : "STACK LOCKED", WIDTH / 2, HEIGHT / 2);
      }
    };

    const updateInvaders = (delta: number) => {
      const st = runtimeRef.current.invaders;
      if (st.over) return;
      const settings = DIFFICULTY_SETTINGS[runtimeRef.current.difficulty];
      const levelMult = 1 + (st.level - 1) * 0.12;

      if (keysRef.current.arrowleft || keysRef.current.a) st.playerX -= 3.4;
      if (keysRef.current.arrowright || keysRef.current.d) st.playerX += 3.4;
      st.playerX = clamp(st.playerX, 10, WIDTH - 38);

      st.timer += delta;
      if ((keysRef.current[" "] || keysRef.current.k) && st.timer > 150) {
        st.shots.push({ x: st.playerX + 14, y: HEIGHT - 34, vx: 0, vy: -4.8, friendly: true });
        st.timer = 0;
      }

      let minX = WIDTH;
      let maxX = 0;
      let alive = 0;

      st.enemies.forEach((e) => {
        if (!e.alive) return;
        alive += 1;
          e.x += st.dir * 0.7 * settings.invaderMove * levelMult;
        minX = Math.min(minX, e.x);
        maxX = Math.max(maxX, e.x + e.w);
        if (Math.random() < 0.0008 * settings.invaderShotRate * levelMult) {
          st.shots.push({ x: e.x + e.w / 2, y: e.y + e.h, vx: 0, vy: 2.2 * settings.invaderMove * levelMult, friendly: false });
        }
      });

      if (minX < 8 || maxX > WIDTH - 8) {
        st.dir *= -1;
        st.enemies.forEach((e) => {
          if (e.alive) e.y += 8;
        });
      }

      st.shots.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
      });

      st.shots = st.shots.filter((s) => s.y > -8 && s.y < HEIGHT + 8);

      for (let i = st.shots.length - 1; i >= 0; i -= 1) {
        const shot = st.shots[i];
        if (shot.friendly) {
          for (const enemy of st.enemies) {
            if (!enemy.alive) continue;
            if (collideRect({ x: shot.x - 2, y: shot.y - 6, w: 4, h: 8 }, { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h })) {
              enemy.alive = false;
              st.score += 100;
              st.shots.splice(i, 1);
              break;
            }
          }
        } else if (collideRect({ x: shot.x - 2, y: shot.y - 5, w: 4, h: 8 }, { x: st.playerX, y: HEIGHT - 24, w: 28, h: 12 })) {
          st.lives -= 1;
          st.shots.splice(i, 1);
          if (st.lives <= 0) st.over = true;
        }
      }

      if (st.enemies.some((e) => e.alive && e.y + e.h >= HEIGHT - 24)) st.over = true;
      if (alive === 0) {
        if (st.level < MAX_LEVEL) {
          st.level += 1;
          st.enemies = createInvaderWave(st.level);
          st.shots = [];
          st.dir = 1;
          st.score += 300;
        } else {
          st.over = true;
          st.won = true;
          st.score += 600;
        }
      }
      setStatusText(`Invaders L${st.level} Score ${st.score} | Lives ${st.lives} - ESC for menu`);
    };

    const drawInvaders = () => {
      const st = runtimeRef.current.invaders;
      ctx.fillStyle = "#01050a";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      st.enemies.forEach((e) => {
        if (!e.alive) return;
        ctx.fillStyle = "#7caaf7";
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.fillStyle = "#d4e7ff";
        ctx.fillRect(e.x + 4, e.y + 4, 4, 4);
        ctx.fillRect(e.x + e.w - 8, e.y + 4, 4, 4);
      });

      st.shots.forEach((s) => {
        ctx.fillStyle = s.friendly ? "#95e6d3" : "#ffb9bd";
        ctx.fillRect(s.x - 1, s.y - 4, 3, 7);
      });

      ctx.fillStyle = "#abd0ff";
      ctx.fillRect(st.playerX, HEIGHT - 24, 28, 12);
      ctx.fillRect(st.playerX + 10, HEIGHT - 29, 8, 5);

      if (st.over) {
        ctx.fillStyle = "rgba(0,0,0,0.72)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "#d7e8ff";
        ctx.font = "700 24px monospace";
        ctx.textAlign = "center";
        ctx.fillText(st.won ? "INVADERS MASTERED" : "BASE OVERRUN", WIDTH / 2, HEIGHT / 2);
      }
    };

    const updateAsteroids = (delta: number) => {
      const st = runtimeRef.current.asteroids;
      if (st.over) return;
      const settings = DIFFICULTY_SETTINGS[runtimeRef.current.difficulty];
      const levelMult = 1 + (st.level - 1) * 0.1;

      const rotateSpeed = 0.0042 * delta;
      if (keysRef.current.arrowleft || keysRef.current.a) st.angle -= rotateSpeed;
      if (keysRef.current.arrowright || keysRef.current.d) st.angle += rotateSpeed;
      if (keysRef.current.arrowup || keysRef.current.w) {
        st.shipVel.x += Math.cos(st.angle) * 0.05 * settings.asteroidThrust * levelMult;
        st.shipVel.y += Math.sin(st.angle) * 0.05 * settings.asteroidThrust * levelMult;
      }

      st.shipPos.x = (st.shipPos.x + st.shipVel.x + WIDTH) % WIDTH;
      st.shipPos.y = (st.shipPos.y + st.shipVel.y + HEIGHT) % HEIGHT;
      st.shipVel.x *= 0.992;
      st.shipVel.y *= 0.992;

      st.shootCooldown -= delta;
      if ((keysRef.current[" "] || keysRef.current.k) && st.shootCooldown <= 0) {
        st.bullets.push({
          x: st.shipPos.x + Math.cos(st.angle) * 14,
          y: st.shipPos.y + Math.sin(st.angle) * 14,
          vx: Math.cos(st.angle) * 4.2 * levelMult,
          vy: Math.sin(st.angle) * 4.2 * levelMult,
          friendly: true
        });
        st.shootCooldown = settings.asteroidShootCd;
      }

      st.bullets.forEach((b) => {
        b.x = (b.x + b.vx + WIDTH) % WIDTH;
        b.y = (b.y + b.vy + HEIGHT) % HEIGHT;
      });

      st.rocks.forEach((rock) => {
        rock.x = (rock.x + rock.vx + WIDTH) % WIDTH;
        rock.y = (rock.y + rock.vy + HEIGHT) % HEIGHT;
      });

      for (let i = st.bullets.length - 1; i >= 0; i -= 1) {
        for (let j = st.rocks.length - 1; j >= 0; j -= 1) {
          const b = st.bullets[i];
          const rock = st.rocks[j];
          const dx = b.x - rock.x;
          const dy = b.y - rock.y;
          if (dx * dx + dy * dy < rock.r * rock.r) {
            st.bullets.splice(i, 1);
            rock.hp -= 1;
            if (rock.hp <= 0) {
              st.score += 120;
              if (rock.r > 15) {
                for (let n = 0; n < 2; n += 1) {
                  st.rocks.push({ x: rock.x, y: rock.y, r: rock.r * 0.62, vx: rand(-1.4, 1.4), vy: rand(-1.4, 1.4), hp: 1 });
                }
              }
              st.rocks.splice(j, 1);
            }
            break;
          }
        }
      }

      for (const rock of st.rocks) {
        const dx = st.shipPos.x - rock.x;
        const dy = st.shipPos.y - rock.y;
        if (dx * dx + dy * dy < (rock.r + 8) * (rock.r + 8)) {
          st.lives -= 1;
          st.shipPos = { x: WIDTH / 2, y: HEIGHT / 2 };
          st.shipVel = { x: 0, y: 0 };
          if (st.lives <= 0) st.over = true;
          break;
        }
      }

      if (st.rocks.length === 0) {
        if (st.level < MAX_LEVEL) {
          st.level += 1;
          st.rocks = createAsteroidField(settings.asteroidCount + st.level * 2, settings.asteroidSpeed * (1 + st.level * 0.09));
          st.bullets = [];
          st.score += 280;
        } else {
          st.over = true;
          st.won = true;
          st.score += 500;
        }
      }
      setStatusText(`Asteroids L${st.level} Score ${st.score} | Lives ${st.lives} - ESC for menu`);
    };

    const drawAsteroids = () => {
      const st = runtimeRef.current.asteroids;
      ctx.fillStyle = "#01050a";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (let i = 0; i < 45; i += 1) {
        ctx.fillStyle = i % 2 ? "rgba(166,200,255,0.32)" : "rgba(120,170,255,0.24)";
        ctx.fillRect((i * 67) % WIDTH, (i * 43) % HEIGHT, 1.4, 1.4);
      }

      ctx.strokeStyle = "#8fb8ff";
      st.rocks.forEach((rock) => {
        ctx.beginPath();
        for (let i = 0; i < 7; i += 1) {
          const angle = (Math.PI * 2 * i) / 7;
          const wobble = rock.r * (0.82 + ((i % 2) * 0.18));
          const x = rock.x + Math.cos(angle) * wobble;
          const y = rock.y + Math.sin(angle) * wobble;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      });

      ctx.strokeStyle = "#9de7d8";
      st.bullets.forEach((b) => {
        ctx.beginPath();
        ctx.moveTo(b.x - b.vx * 0.7, b.y - b.vy * 0.7);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });

      const tipX = st.shipPos.x + Math.cos(st.angle) * 11;
      const tipY = st.shipPos.y + Math.sin(st.angle) * 11;
      const leftX = st.shipPos.x + Math.cos(st.angle + 2.4) * 10;
      const leftY = st.shipPos.y + Math.sin(st.angle + 2.4) * 10;
      const rightX = st.shipPos.x + Math.cos(st.angle - 2.4) * 10;
      const rightY = st.shipPos.y + Math.sin(st.angle - 2.4) * 10;

      ctx.strokeStyle = "#d3e7ff";
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(leftX, leftY);
      ctx.lineTo(rightX, rightY);
      ctx.closePath();
      ctx.stroke();

      if (st.over) {
        ctx.fillStyle = "rgba(0,0,0,0.72)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "#d7e8ff";
        ctx.font = "700 24px monospace";
        ctx.textAlign = "center";
        ctx.fillText(st.won ? "ASTEROIDS MASTERED" : "SHIP DESTROYED", WIDTH / 2, HEIGHT / 2);
      }
    };

    const frame = (time: number) => {
      const delta = time - last;
      last = time;

      const runtime = runtimeRef.current;
      if (runtime.mode === "menu") {
        drawMenu(ctx, runtime.menuIndex, runtime.difficulty);
      } else if (runtime.activeGame === "snake") {
        updateSnake(delta);
        drawSnake();
      } else if (runtime.activeGame === "pong") {
        updatePong(delta);
        drawPong();
      } else if (runtime.activeGame === "breakout") {
        updateBreakout();
        drawBreakout();
      } else if (runtime.activeGame === "tetris") {
        updateTetris(delta);
        drawTetris();
      } else if (runtime.activeGame === "invaders") {
        updateInvaders(delta);
        drawInvaders();
      } else if (runtime.activeGame === "asteroids") {
        updateAsteroids(delta);
        drawAsteroids();
      }

      if (runtime.mode === "playing" && runtime.activeGame) {
        let hud = "";
        if (runtime.activeGame === "snake") {
          hud = `L${runtime.snake.level}  SCORE ${runtime.snake.score}`;
        } else if (runtime.activeGame === "pong") {
          hud = `L${runtime.pong.level}  YOU ${runtime.pong.scoreL}  CPU ${runtime.pong.scoreR}`;
        } else if (runtime.activeGame === "breakout") {
          hud = `L${runtime.breakout.level}  SCORE ${runtime.breakout.score}  LIVES ${runtime.breakout.lives}`;
        } else if (runtime.activeGame === "tetris") {
          hud = `L${runtime.tetris.level}  SCORE ${runtime.tetris.score}`;
        } else if (runtime.activeGame === "invaders") {
          hud = `L${runtime.invaders.level}  SCORE ${runtime.invaders.score}  LIVES ${runtime.invaders.lives}`;
        } else if (runtime.activeGame === "asteroids") {
          hud = `L${runtime.asteroids.level}  SCORE ${runtime.asteroids.score}  LIVES ${runtime.asteroids.lives}`;
        }

        ctx.fillStyle = "rgba(3, 8, 16, 0.78)";
        ctx.fillRect(0, HEIGHT - 20, WIDTH, 20);
        ctx.strokeStyle = "rgba(120, 170, 255, 0.25)";
        ctx.beginPath();
        ctx.moveTo(0, HEIGHT - 20);
        ctx.lineTo(WIDTH, HEIGHT - 20);
        ctx.stroke();
        ctx.fillStyle = "#a8d4ff";
        ctx.font = "600 11px monospace";
        ctx.textAlign = "left";
        ctx.fillText(hud, 10, HEIGHT - 7);
      }

      raf = window.requestAnimationFrame(frame);
    };

    raf = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="max-w-3xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accentBlue/80">Arcade Corner</p>

      <div className="retro-tv-shell">
        <div className="retro-tv-chassis">
          <div className="retro-tv-screen-wrap">
            <div className="retro-tv-bezel">
              <div className="retro-tv-screen">
                <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="h-auto w-full touch-none select-none" />
                <div className="retro-tv-glare" />
              </div>
            </div>
          </div>

          <div className="retro-tv-controls">
            <div className="retro-tv-badge">RETRO ARCADE</div>
            <div className="mt-1 rounded-md border border-[#6c6b6a] bg-[#c9c8c4] p-2">
              {isMobileControls ? (
                <div className="mx-auto flex items-center justify-center gap-4">
                  <div
                    className="relative h-[146px] w-[146px] touch-none rounded-full border border-[#2f2f2f] bg-[#3a3a3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      joystickPointerIdRef.current = event.pointerId;
                      event.currentTarget.setPointerCapture(event.pointerId);
                      updateJoystickFromPointer(event);
                    }}
                    onPointerMove={(event) => {
                      if (joystickPointerIdRef.current !== event.pointerId) return;
                      updateJoystickFromPointer(event);
                    }}
                    onPointerUp={(event) => {
                      if (joystickPointerIdRef.current !== event.pointerId) return;
                      releaseJoystick();
                    }}
                    onPointerCancel={releaseJoystick}
                    onPointerLeave={(event) => {
                      if (joystickPointerIdRef.current !== event.pointerId) return;
                      releaseJoystick();
                    }}
                  >
                    <div className="absolute left-1/2 top-1/2 h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
                    <div
                      className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1d1d1d] bg-[#2b2b2b] shadow-[0_3px_10px_rgba(0,0,0,0.35)]"
                      style={{ transform: `translate(calc(-50% + ${joystickKnob.x}px), calc(-50% + ${joystickKnob.y}px))` }}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      aria-label={actionAriaLabel}
                      className="h-16 w-16 rounded-full border border-[#6a2f5b] bg-gradient-to-b from-[#c068ad] to-[#91417e] text-sm font-bold text-[#fff2fc] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                      onPointerDown={handleActionPress}
                      onPointerUp={handleActionRelease}
                      onPointerCancel={handleActionRelease}
                      onPointerLeave={handleActionRelease}
                    >
                      {mode === "menu" ? "GO" : "A"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-[#5a5c65] bg-[#878b96] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1b1f2a]"
                      onClick={() => {
                        if (mode === "menu") tapKey("Enter");
                        else {
                          handleInputKeyDown("Escape");
                          handleInputKeyUp("Escape");
                        }
                      }}
                    >
                      {mode === "menu" ? "Start" : "Menu"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[82px_92px] justify-center gap-3">
                    <div className="relative h-[76px] w-[76px]">
                      <button
                        type="button"
                        className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 rounded-[0.35rem] border border-[#1c1c1c] bg-[#303030] text-[11px] font-bold text-[#d5d5d5]"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          handleInputKeyDown("ArrowUp");
                        }}
                        onPointerUp={() => handleInputKeyUp("ArrowUp")}
                        onPointerCancel={() => handleInputKeyUp("ArrowUp")}
                        onPointerLeave={() => handleInputKeyUp("ArrowUp")}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="absolute left-0 top-1/2 h-7 w-7 -translate-y-1/2 rounded-[0.35rem] border border-[#1c1c1c] bg-[#303030] text-[11px] font-bold text-[#d5d5d5]"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          handleInputKeyDown("ArrowLeft");
                        }}
                        onPointerUp={() => handleInputKeyUp("ArrowLeft")}
                        onPointerCancel={() => handleInputKeyUp("ArrowLeft")}
                        onPointerLeave={() => handleInputKeyUp("ArrowLeft")}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className="absolute bottom-0 left-1/2 h-7 w-7 -translate-x-1/2 rounded-[0.35rem] border border-[#1c1c1c] bg-[#303030] text-[11px] font-bold text-[#d5d5d5]"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          handleInputKeyDown("ArrowDown");
                        }}
                        onPointerUp={() => handleInputKeyUp("ArrowDown")}
                        onPointerCancel={() => handleInputKeyUp("ArrowDown")}
                        onPointerLeave={() => handleInputKeyUp("ArrowDown")}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="absolute right-0 top-1/2 h-7 w-7 -translate-y-1/2 rounded-[0.35rem] border border-[#1c1c1c] bg-[#303030] text-[11px] font-bold text-[#d5d5d5]"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          handleInputKeyDown("ArrowRight");
                        }}
                        onPointerUp={() => handleInputKeyUp("ArrowRight")}
                        onPointerCancel={() => handleInputKeyUp("ArrowRight")}
                        onPointerLeave={() => handleInputKeyUp("ArrowRight")}
                      >
                        →
                      </button>
                    </div>

                    <div className="grid content-start gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full border border-[#6a2f5b] bg-gradient-to-b from-[#b45ea1] to-[#8a3e78] text-[10px] font-bold text-[#f3d9ed] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                          onClick={() => {
                            handleInputKeyDown("Escape");
                            handleInputKeyUp("Escape");
                          }}
                        >
                          B
                        </button>
                        <button
                          type="button"
                          aria-label={actionAriaLabel}
                          className="h-9 w-9 rounded-full border border-[#6a2f5b] bg-gradient-to-b from-[#c068ad] to-[#91417e] text-[10px] font-bold text-[#fff2fc] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                          onPointerDown={handleActionPress}
                          onPointerUp={handleActionRelease}
                          onPointerCancel={handleActionRelease}
                          onPointerLeave={handleActionRelease}
                        >
                          A
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-center gap-1.5">
                    <button
                      type="button"
                      className="rounded-full border border-[#5a5c65] bg-[#878b96] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#1b1f2a]"
                      onClick={() => {
                        handleInputKeyDown("Escape");
                        handleInputKeyUp("Escape");
                      }}
                    >
                      Select
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-[#5a5c65] bg-[#878b96] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#1b1f2a]"
                      onClick={() => {
                        tapKey("Enter");
                      }}
                    >
                      Start
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="retro-tv-grille">
              {Array.from({ length: 10 }).map((_, idx) => (
                <span key={idx} />
              ))}
            </div>
            <p className="mt-2 text-[9px] leading-tight text-[#6e7686]">{gameplayHint}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#b5c8eb]">{mode === "menu" ? "Select a game and press Enter or click." : `Now Playing: ${activeGame?.toUpperCase()}`}</p>
        <button
          type="button"
          onClick={resetToMenu}
          className="rounded-full border border-accentBlue/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-accentBlueSoft transition-colors duration-200 hover:border-accentBlueSoft hover:text-white"
        >
          Back To Menu
        </button>
      </div>

      <p className="mt-3 text-xs text-[#9cb4dd]">{statusText}</p>
      {mode === "menu" && (
        <p className="mt-1 text-xs text-[#7e95bf]">
          Selected: {MENU_ITEMS[menuIndex].label} | Difficulty: {difficulty.toUpperCase()}
        </p>
      )}
    </div>
  );
}
