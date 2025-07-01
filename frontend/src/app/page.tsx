'use client';
import { useRef, useState } from 'react';
export default function Home() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);

	const startDraw = (e: React.MouseEvent) => {
		const ctx = canvasRef.current?.getContext('2d');
		if (!ctx) return;
		ctx.beginPath();
		ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
		setIsDrawing(true);
	};

	const draw = (e: React.MouseEvent) => {
		if (!isDrawing || !canvasRef.current) return;
		const ctx = canvasRef.current.getContext('2d');
		if (!ctx) return;
		ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 20;
		ctx.lineCap = 'round';
		ctx.stroke();
	};

	const endDraw = () => {
		setIsDrawing(false);
	};
	const clearCanvas = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = 'white'; // couleur de fond
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	};
	return (
		<div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
			<main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
				<canvas
					ref={canvasRef}
					width={280}
					height={280}
					className='border bg-white'
					onMouseDown={startDraw}
					onMouseMove={draw}
					onMouseUp={endDraw}
					onMouseLeave={endDraw}
				/>
				<div className='flex flex-col justify-center w-full'>
					<button
						className='bg-white text-black px-4 py-2 rounded-xl'
						onClick={clearCanvas}>
						Réinitialiser
					</button>
					<button
						className='mt-4 bg-white text-black px-4 py-2 rounded-xl'
						onClick={async () => {
							const canvas = canvasRef.current;
							if (!canvas) return;
							const imageData = canvas.toDataURL('image/png');
							const res = await fetch("https://td-cnn.onrender.com/predict" /* 'http://localhost:8000/predict' */, {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ image: imageData }),
							});
							const data = await res.json();
							alert(`Prédiction : ${data.prediction}`);
						}}>
						Prédire
					</button>
				</div>
			</main>
		</div>
	);
}
