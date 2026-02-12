"use client";

import { useEffect, useRef, useCallback } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulseTimer: number;
  isPulsing: boolean;
}

const TEAL = { r: 147, g: 207, b: 189 };
const RED = { r: 202, g: 6, b: 16 };

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);

  const getNodeCount = useCallback(() => {
    if (typeof window === "undefined") return 40;
    return window.innerWidth < 768 ? 20 : 45;
  }, []);

  const getConnectionDistance = useCallback(() => {
    if (typeof window === "undefined") return 150;
    return window.innerWidth < 768 ? 120 : 150;
  }, []);

  const initNodes = useCallback(
    (width: number, height: number) => {
      const count = getNodeCount();
      const nodes: Node[] = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: 1.5 + Math.random() * 1,
          pulseTimer: Math.random() * 500,
          isPulsing: false,
        });
      }
      return nodes;
    },
    [getNodeCount]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check reduced motion preference
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mql.matches;
    const motionHandler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mql.addEventListener("change", motionHandler);

    // Resize handler
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();

    nodesRef.current = initNodes(window.innerWidth, window.innerHeight);

    // Mouse tracking (desktop only)
    const isMobile = window.innerWidth < 768;
    const handleMouse = (e: MouseEvent) => {
      if (!isMobile) {
        mouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("resize", resize, { passive: true });

    const connectionDist = getConnectionDistance();

    const animate = () => {
      if (!ctx || !canvas) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;

      if (!reducedMotionRef.current) {
        // Update node positions
        for (const node of nodes) {
          // Mouse attraction
          const dx = mouseRef.current.x - node.x;
          const dy = mouseRef.current.y - node.y;
          const mouseDist = Math.sqrt(dx * dx + dy * dy);
          if (mouseDist < 200 && mouseDist > 0) {
            const force = (200 - mouseDist) / 200;
            node.vx += (dx / mouseDist) * force * 0.02;
            node.vy += (dy / mouseDist) * force * 0.02;
          }

          // Damping
          node.vx *= 0.99;
          node.vy *= 0.99;

          node.x += node.vx;
          node.y += node.vy;

          // Bounce off edges
          if (node.x < 0 || node.x > w) node.vx *= -1;
          if (node.y < 0 || node.y > h) node.vy *= -1;
          node.x = Math.max(0, Math.min(w, node.x));
          node.y = Math.max(0, Math.min(h, node.y));

          // Random pulse (like a transaction)
          node.pulseTimer--;
          if (node.pulseTimer <= 0) {
            node.isPulsing = true;
            node.pulseTimer = 300 + Math.random() * 600;
          }
          if (node.isPulsing) {
            node.pulseTimer++;
            if (node.pulseTimer > 20) node.isPulsing = false;
          }
        }
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const opacity = (1 - dist / connectionDist) * 0.3;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${TEAL.r}, ${TEAL.g}, ${TEAL.b}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

        if (node.isPulsing) {
          ctx.fillStyle = `rgba(${RED.r}, ${RED.g}, ${RED.b}, 0.8)`;
          // Pulse glow
          ctx.shadowColor = `rgba(${RED.r}, ${RED.g}, ${RED.b}, 0.5)`;
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(${TEAL.r}, ${TEAL.g}, ${TEAL.b}, 0.5)`;
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", resize);
      mql.removeEventListener("change", motionHandler);
    };
  }, [initNodes, getConnectionDistance]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-40"
    />
  );
}
