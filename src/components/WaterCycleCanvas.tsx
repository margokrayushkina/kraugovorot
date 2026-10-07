import { useRef, useEffect, useCallback, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'vapor' | 'rain' | 'surface' | 'underground' | 'transpiration';
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
}

interface WaterCycleCanvasProps {
  sunIntensity: number; // 0-1
  isPaused: boolean;
  showLabels: boolean;
  highlightProcess: string | null; // 'evaporation' | 'condensation' | 'precipitation' | 'runoff' | 'infiltration' | null
  onElementClick: (elementId: string) => void;
}

export default function WaterCycleCanvas({
  sunIntensity,
  isPaused,
  showLabels,
  highlightProcess,
  onElementClick
}: WaterCycleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });

  // Определяем зоны для кликов (в процентах от размера canvas)
  const clickableZones = {
    sun: { x: 5, y: 3, w: 12, h: 18 },
    ocean: { x: 0, y: 65, w: 30, h: 35 },
    cloud: { x: 35, y: 8, w: 30, h: 22 },
    mountain: { x: 55, y: 30, w: 25, h: 35 },
    river: { x: 30, y: 60, w: 35, h: 10 },
    groundwater: { x: 10, y: 85, w: 80, h: 15 },
    plants: { x: 45, y: 48, w: 15, h: 20 },
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    for (const [id, zone] of Object.entries(clickableZones)) {
      if (
        xPercent >= zone.x && xPercent <= zone.x + zone.w &&
        yPercent >= zone.y && yPercent <= zone.y + zone.h
      ) {
        onElementClick(id);
        return;
      }
    }
  }, [onElementClick]);

  // Создание частиц
  const createParticle = useCallback((type: Particle['type'], w: number, h: number): Particle => {
    switch (type) {
      case 'vapor':
        return {
          x: Math.random() * w * 0.3,
          y: h * 0.65 + Math.random() * 10,
          vx: (Math.random() - 0.3) * 0.5,
          vy: -(0.5 + Math.random() * 1.5),
          type: 'vapor',
          alpha: 0.3 + Math.random() * 0.4,
          size: 2 + Math.random() * 3,
          life: 0,
          maxLife: 150 + Math.random() * 100,
        };
      case 'transpiration':
        return {
          x: w * 0.45 + Math.random() * w * 0.15,
          y: h * 0.48 + Math.random() * h * 0.1,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(0.3 + Math.random() * 0.8),
          type: 'transpiration',
          alpha: 0.2 + Math.random() * 0.3,
          size: 1.5 + Math.random() * 2,
          life: 0,
          maxLife: 120 + Math.random() * 80,
        };
      case 'rain':
        return {
          x: w * 0.35 + Math.random() * w * 0.3,
          y: h * 0.15 + Math.random() * h * 0.05,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 2 + Math.random() * 3,
          type: 'rain',
          alpha: 0.6 + Math.random() * 0.4,
          size: 2 + Math.random() * 2,
          life: 0,
          maxLife: 100 + Math.random() * 60,
        };
      case 'surface':
        return {
          x: w * 0.5 + Math.random() * w * 0.2,
          y: h * 0.62 + Math.random() * h * 0.03,
          vx: -(1 + Math.random() * 1.5),
          vy: 0.2 + Math.random() * 0.3,
          type: 'surface',
          alpha: 0.5 + Math.random() * 0.3,
          size: 2 + Math.random() * 2,
          life: 0,
          maxLife: 200 + Math.random() * 100,
        };
      case 'underground':
        return {
          x: w * 0.5 + Math.random() * w * 0.3,
          y: h * 0.78 + Math.random() * h * 0.05,
          vx: -(0.2 + Math.random() * 0.4),
          vy: 0.1 + Math.random() * 0.2,
          type: 'underground',
          alpha: 0.3 + Math.random() * 0.2,
          size: 2 + Math.random() * 2,
          life: 0,
          maxLife: 300 + Math.random() * 200,
        };
      default:
        return { x: 0, y: 0, vx: 0, vy: 0, type: 'vapor', alpha: 0, size: 0, life: 0, maxLife: 100 };
    }
  }, []);

  // Определение прозрачности процесса
  const getProcessAlpha = (particleType: string): number => {
    if (!highlightProcess) return 1;
    const mapping: Record<string, string[]> = {
      'evaporation': ['vapor', 'transpiration'],
      'condensation': ['vapor', 'transpiration'],
      'precipitation': ['rain'],
      'runoff': ['surface'],
      'infiltration': ['underground'],
    };
    const relevantTypes = mapping[highlightProcess] || [];
    return relevantTypes.includes(particleType) ? 1 : 0.15;
  };

  // Отрисовка SVG-ландшафта на Canvas
  const drawLandscape = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
    // Небо — градиент
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    skyGrad.addColorStop(0, '#1e90ff');
    skyGrad.addColorStop(0.5, '#87ceeb');
    skyGrad.addColorStop(1, '#b0e0e6');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.65);

    // Солнце
    const sunX = w * 0.1;
    const sunY = h * 0.1;
    const sunRadius = w * 0.04;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 2);
    sunGlow.addColorStop(0, 'rgba(255, 220, 50, 1)');
    sunGlow.addColorStop(0.5, 'rgba(255, 180, 0, 0.6)');
    sunGlow.addColorStop(1, 'rgba(255, 150, 0, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
    ctx.fill();
    // Лучи солнца
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.001;
      const innerR = sunRadius * 1.2;
      const outerR = sunRadius * 1.8 + Math.sin(time * 0.003 + i) * 5;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * innerR, sunY + Math.sin(angle) * innerR);
      ctx.lineTo(sunX + Math.cos(angle) * outerR, sunY + Math.sin(angle) * outerR);
      ctx.stroke();
    }
    // Диск солнца
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Горы (задний план)
    ctx.fillStyle = '#5a7247';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.65);
    ctx.lineTo(w * 0.6, h * 0.3);
    ctx.lineTo(w * 0.7, h * 0.35);
    ctx.lineTo(w * 0.78, h * 0.28);
    ctx.lineTo(w * 0.88, h * 0.4);
    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(w, h * 0.65);
    ctx.closePath();
    ctx.fill();

    // Горы (передний план)
    ctx.fillStyle = '#6b8f52';
    ctx.beginPath();
    ctx.moveTo(w * 0.4, h * 0.65);
    ctx.lineTo(w * 0.55, h * 0.38);
    ctx.lineTo(w * 0.65, h * 0.42);
    ctx.lineTo(w * 0.75, h * 0.35);
    ctx.lineTo(w * 0.85, h * 0.45);
    ctx.lineTo(w * 0.95, h * 0.55);
    ctx.lineTo(w, h * 0.65);
    ctx.closePath();
    ctx.fill();

    // Снежные шапки
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(w * 0.57, h * 0.39);
    ctx.lineTo(w * 0.55, h * 0.38);
    ctx.lineTo(w * 0.53, h * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.77, h * 0.36);
    ctx.lineTo(w * 0.75, h * 0.35);
    ctx.lineTo(w * 0.73, h * 0.37);
    ctx.closePath();
    ctx.fill();

    // Земля / равнина
    const groundGrad = ctx.createLinearGradient(0, h * 0.6, 0, h * 0.75);
    groundGrad.addColorStop(0, '#7cb342');
    groundGrad.addColorStop(1, '#558b2f');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.6, w, h * 0.15);

    // Океан
    const oceanGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
    oceanGrad.addColorStop(0, '#1976d2');
    oceanGrad.addColorStop(0.3, '#1565c0');
    oceanGrad.addColorStop(1, '#0d47a1');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, h * 0.65, w * 0.3, h * 0.35);

    // Волны на океане
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const waveY = h * 0.68 + i * h * 0.06;
      ctx.beginPath();
      for (let x = 0; x < w * 0.3; x += 5) {
        const y = waveY + Math.sin((x + time * 0.5 + i * 20) * 0.02) * 3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Подземный слой
    const undergroundGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
    undergroundGrad.addColorStop(0, '#795548');
    undergroundGrad.addColorStop(0.3, '#5d4037');
    undergroundGrad.addColorStop(1, '#3e2723');
    ctx.fillStyle = undergroundGrad;
    ctx.fillRect(w * 0.3, h * 0.75, w * 0.7, h * 0.25);

    // Уровень грунтовых вод
    ctx.fillStyle = 'rgba(30, 136, 229, 0.3)';
    ctx.fillRect(w * 0.3, h * 0.82, w * 0.7, h * 0.05);
    // Точки подземных вод
    ctx.fillStyle = 'rgba(30, 136, 229, 0.5)';
    for (let i = 0; i < 30; i++) {
      const px = w * 0.32 + Math.random() * w * 0.65;
      const py = h * 0.82 + Math.random() * h * 0.05;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Река
    ctx.fillStyle = '#2196f3';
    ctx.beginPath();
    ctx.moveTo(w * 0.65, h * 0.55);
    ctx.quadraticCurveTo(w * 0.55, h * 0.6, w * 0.45, h * 0.63);
    ctx.quadraticCurveTo(w * 0.35, h * 0.65, w * 0.3, h * 0.67);
    ctx.lineTo(w * 0.3, h * 0.7);
    ctx.quadraticCurveTo(w * 0.35, h * 0.68, w * 0.45, h * 0.66);
    ctx.quadraticCurveTo(w * 0.55, h * 0.63, w * 0.65, h * 0.58);
    ctx.closePath();
    ctx.fill();

    // Деревья
    const treePositions = [
      { x: 0.42, y: 0.55 }, { x: 0.48, y: 0.53 }, { x: 0.52, y: 0.56 },
      { x: 0.38, y: 0.58 }, { x: 0.56, y: 0.54 }, { x: 0.44, y: 0.57 },
    ];
    treePositions.forEach(tree => {
      const tx = w * tree.x;
      const ty = h * tree.y;
      // Ствол
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(tx - 3, ty, 6, h * 0.05);
      // Крона
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.arc(tx, ty - 5, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#388e3c';
      ctx.beginPath();
      ctx.arc(tx + 5, ty, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx - 5, ty, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // Облака
    const cloudAlpha = highlightProcess === 'condensation' ? 1 : 0.85;
    ctx.fillStyle = `rgba(255, 255, 255, ${cloudAlpha})`;
    const cloudDarkness = Math.sin(time * 0.002) * 0.1;
    const cloudGray = Math.floor(255 - cloudDarkness * 50);
    ctx.fillStyle = `rgba(${cloudGray}, ${cloudGray}, ${cloudGray}, ${cloudAlpha})`;
    // Облако 1
    drawCloud(ctx, w * 0.4, h * 0.12, 50);
    // Облако 2
    drawCloud(ctx, w * 0.55, h * 0.1, 60);
    // Облако 3
    drawCloud(ctx, w * 0.65, h * 0.14, 45);
  }, [highlightProcess]);

  // Функция отрисовки облака
  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y + size * 0.15, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y + size * 0.1, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  };

  // Отрисовка подписей
  const drawLabels = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (!showLabels) return;
    ctx.font = `bold ${Math.max(14, w * 0.012)}px Segoe UI, sans-serif`;
    ctx.textAlign = 'center';

    const labels = [
      { text: '☀️ Солнце', x: w * 0.1, y: h * 0.22 },
      { text: '🌊 Океан', x: w * 0.15, y: h * 0.75 },
      { text: '☁️ Облака', x: w * 0.52, y: h * 0.08 },
      { text: '🏔️ Горы', x: w * 0.72, y: h * 0.32 },
      { text: '🏞️ Река', x: w * 0.48, y: h * 0.61 },
      { text: '💧 Подземные воды', x: w * 0.6, y: h * 0.88 },
      { text: '🌳 Растения', x: w * 0.47, y: h * 0.5 },
    ];

    labels.forEach(label => {
      // Фон для читаемости
      const metrics = ctx.measureText(label.text);
      const padding = 6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(
        label.x - metrics.width / 2 - padding,
        label.y - 10 - padding,
        metrics.width + padding * 2,
        20 + padding * 2
      );
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        label.x - metrics.width / 2 - padding,
        label.y - 10 - padding,
        metrics.width + padding * 2,
        20 + padding * 2
      );
      ctx.fillStyle = '#333';
      ctx.fillText(label.text, label.x, label.y + 5);
    });
  }, [showLabels]);

  // Отрисовка стрелок процессов
  const drawProcessArrows = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
    if (!highlightProcess) return;

    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    const dashOffset = -time * 0.05;
    ctx.lineDashOffset = dashOffset;

    const arrows: Record<string, { points: { x: number; y: number }[], color: string }> = {
      'evaporation': {
        points: [
          { x: w * 0.15, y: h * 0.63 },
          { x: w * 0.2, y: h * 0.4 },
          { x: w * 0.3, y: h * 0.25 },
        ],
        color: '#ff9800'
      },
      'condensation': {
        points: [
          { x: w * 0.3, y: h * 0.25 },
          { x: w * 0.4, y: h * 0.15 },
          { x: w * 0.55, y: h * 0.12 },
        ],
        color: '#9c27b0'
      },
      'precipitation': {
        points: [
          { x: w * 0.55, y: h * 0.18 },
          { x: w * 0.55, y: h * 0.35 },
          { x: w * 0.55, y: h * 0.55 },
        ],
        color: '#2196f3'
      },
      'runoff': {
        points: [
          { x: w * 0.55, y: h * 0.6 },
          { x: w * 0.45, y: h * 0.63 },
          { x: w * 0.3, y: h * 0.67 },
        ],
        color: '#00bcd4'
      },
      'infiltration': {
        points: [
          { x: w * 0.55, y: h * 0.65 },
          { x: w * 0.55, y: h * 0.75 },
          { x: w * 0.5, y: h * 0.85 },
        ],
        color: '#795548'
      },
    };

    const arrow = arrows[highlightProcess];
    if (!arrow) return;

    ctx.strokeStyle = arrow.color;
    ctx.beginPath();
    ctx.moveTo(arrow.points[0].x, arrow.points[0].y);
    for (let i = 1; i < arrow.points.length; i++) {
      ctx.lineTo(arrow.points[i].x, arrow.points[i].y);
    }
    ctx.stroke();

    // Стрелка на конце
    const last = arrow.points[arrow.points.length - 1];
    const prev = arrow.points[arrow.points.length - 2];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
    ctx.setLineDash([]);
    ctx.fillStyle = arrow.color;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(last.x - 12 * Math.cos(angle - 0.4), last.y - 12 * Math.sin(angle - 0.4));
    ctx.lineTo(last.x - 12 * Math.cos(angle + 0.4), last.y - 12 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }, [highlightProcess]);

  // Главный цикл анимации
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w;
      canvas.height = h;
      setCanvasSize({ width: w, height: h });
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      if (isPaused) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      timeRef.current += 1;
      const time = timeRef.current;

      // Очистка
      ctx.clearRect(0, 0, w, h);

      // Рисуем ландшафт
      drawLandscape(ctx, w, h, time);

      // Добавляем новые частицы
      const spawnRate = 0.3 + sunIntensity * 0.7;
      if (Math.random() < spawnRate * 0.3) {
        particlesRef.current.push(createParticle('vapor', w, h));
      }
      if (Math.random() < spawnRate * 0.15) {
        particlesRef.current.push(createParticle('transpiration', w, h));
      }
      if (Math.random() < 0.2) {
        particlesRef.current.push(createParticle('rain', w, h));
      }
      if (Math.random() < 0.1) {
        particlesRef.current.push(createParticle('surface', w, h));
      }
      if (Math.random() < 0.05) {
        particlesRef.current.push(createParticle('underground', w, h));
      }

      // Обновляем и рисуем частицы
      particlesRef.current = particlesRef.current.filter(p => {
        p.life++;
        if (p.life > p.maxLife) return false;

        // Обновление позиции
        const speedMult = 0.5 + sunIntensity * 0.8;
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;

        // Специфичная логика для типов
        if (p.type === 'vapor') {
          p.vx += (Math.random() - 0.5) * 0.1;
          p.alpha = Math.max(0, 0.5 - p.life / p.maxLife * 0.5);
        } else if (p.type === 'transpiration') {
          p.vx += (Math.random() - 0.5) * 0.05;
          p.alpha = Math.max(0, 0.4 - p.life / p.maxLife * 0.4);
        } else if (p.type === 'rain') {
          p.vy += 0.05; // гравитация
        } else if (p.type === 'surface') {
          p.vy += 0.01;
          if (p.x < w * 0.3) return false; // достиг океана
        } else if (p.type === 'underground') {
          if (p.x < w * 0.3) return false; // достиг океана
        }

        // Проверка границ
        if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) return false;

        // Рисуем частицу
        const alphaMult = getProcessAlpha(p.type);
        ctx.globalAlpha = p.alpha * alphaMult;

        if (p.type === 'vapor' || p.type === 'transpiration') {
          // Пар — полупрозрачные белые кружки
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'rain') {
          // Дождь — синие капли
          ctx.fillStyle = '#2196f3';
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size * 0.5, p.size * 1.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'surface') {
          // Поверхностный сток — голубые частицы
          ctx.fillStyle = '#03a9f4';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'underground') {
          // Подземные воды — тёмно-синие
          ctx.fillStyle = '#1565c0';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
        return true;
      });

      // Ограничение количества частиц
      if (particlesRef.current.length > 500) {
        particlesRef.current = particlesRef.current.slice(-400);
      }

      // Рисуем стрелки процессов
      drawProcessArrows(ctx, w, h, time);

      // Рисуем подписи
      drawLabels(ctx, w, h);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, sunIntensity, drawLandscape, drawLabels, drawProcessArrows, createParticle, highlightProcess]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-pointer"
      onClick={handleCanvasClick}
      style={{ display: 'block' }}
    />
  );
}
