import { useState, useEffect, useRef } from "react";
import "./lottery.css";
import { genTicket, sum } from "./helper";

export default function Lottery() {
  const [ticket, setTicket] = useState(genTicket(3));
  const [count, setCount] = useState(0);
  const isWinning = sum(ticket) === 10;
  const prevWinRef = useRef(false);
  const cardRef = useRef(null);

  const dragState = useRef({
    dragging: false,
    offsetX: 0,
    offsetY: 0,
  });

  // Play sound on win
  const playVictorySound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const melody = [
      { freq: 523.25, dur: 0.15 },
      { freq: 659.25, dur: 0.15 },
      { freq: 783.99, dur: 0.15 },
      { freq: 1046.5, dur: 0.25 },
    ];
    melody.forEach((note, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = note.freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = now + melody.slice(0, i).reduce((acc, n) => acc + n.dur, 0);
      const end = start + note.dur;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.35, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, end);
      osc.start(start);
      osc.stop(end + 0.05);
    });
  };

  const playClickSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 220;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.12);
  };

  useEffect(() => {
    if (isWinning && !prevWinRef.current) {
      playVictorySound();
    }
    prevWinRef.current = isWinning;
  }, [isWinning]);

  const regenerate = () => {
    if (!isWinning) {
      playClickSound();
      setTicket(genTicket(3));
      setCount((prev) => prev + 1);
    }
  };

  // Enable drag only after winning
  useEffect(() => {
    if (!isWinning) return;

    const card = cardRef.current;
    if (!card) return;

    const handleMouseDown = (e) => {
      dragState.current.dragging = true;
      const rect = card.getBoundingClientRect();
      dragState.current.offsetX = e.clientX - rect.left;
      dragState.current.offsetY = e.clientY - rect.top;
      card.style.cursor = "grabbing";
      card.style.transform = '';
    };

    const handleMouseMove = (e) => {
      if (!dragState.current.dragging) return;

      const { offsetX, offsetY } = dragState.current;
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;

      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
    };

    const handleMouseUp = () => {
      dragState.current.dragging = false;
      card.style.cursor = "grab";
    };

    card.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      card.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isWinning]);

  return (
    <div className="outer-container">
      {isWinning && (
        <div className="win-full-bg">
          {count + 1} no. bar a jitechis so {count + 1} bar treat de
        </div>
      )}

      <div className="click-counter">{count}</div>

      <div
        ref={cardRef}
        className={`LotteryTicketRoot ${isWinning ? "floatable" : ""}`}
        style={{
          position: isWinning ? "fixed" : "static",
          zIndex: isWinning ? 1000 : "auto",
        }}
      >
        <h1>Lottery Ticket</h1>
        {isWinning && <div className="win-badge">YOU WON!</div>}
        <div className="ticket">
          <span>{ticket[0]}</span>
          <span>{ticket[1]}</span>
          <span>{ticket[2]}</span>
        </div>
        {isWinning ? (
          <>
            <h3>🎉 Congratulations, you won! 🎉</h3>
            <p className="drag-hint">Drag me to see what's written behind</p>
          </>
        ) : (
          <h3>Try again!</h3>
        )}
        <button onClick={regenerate} disabled={isWinning}>
          New Ticket
        </button>
      </div>
    </div>
  );
}
