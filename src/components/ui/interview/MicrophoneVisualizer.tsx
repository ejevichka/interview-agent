import { useEffect, useRef } from 'react';

interface MicrophoneVisualizerProps {
  isListening: boolean;
  volume: number;
}

const MicrophoneVisualizer = ({ isListening, volume }: MicrophoneVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isListening) {
        // Draw static bars when not listening
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = '#374151';
          ctx.fillRect(i * 12, 0, 8, 40);
        }
        return;
      }

      // Draw animated bars based on volume
      const barCount = 5;
      const barWidth = 8;
      const barSpacing = 4;
      const maxHeight = 40;

      for (let i = 0; i < barCount; i++) {
        const height = Math.max(4, (volume * maxHeight * (i + 1)) / barCount);
        const x = i * (barWidth + barSpacing);
        const y = (maxHeight - height) / 2;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(1, '#60A5FA');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, height);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, volume]);

  return (
    <div className="flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        width={80}
        height={40}
        className="rounded-lg"
      />
    </div>
  );
};

export default MicrophoneVisualizer; 