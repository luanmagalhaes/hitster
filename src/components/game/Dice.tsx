interface DiceProps {
  face: number;
  className?: string;
}

const layouts: Record<number, Array<[number, number]>> = {
  1: [[2, 2]],
  2: [
    [1, 1],
    [3, 3],
  ],
  3: [
    [1, 1],
    [2, 2],
    [3, 3],
  ],
  4: [
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
  ],
  5: [
    [1, 1],
    [1, 3],
    [2, 2],
    [3, 1],
    [3, 3],
  ],
  6: [
    [1, 1],
    [1, 3],
    [2, 1],
    [2, 3],
    [3, 1],
    [3, 3],
  ],
};

export function Dice({ face, className = "" }: DiceProps) {
  const pips = layouts[face] ?? layouts[1];

  return (
    <div
      className={`grid aspect-square grid-cols-3 grid-rows-3 gap-1 rounded-[22%] border-4 border-ink bg-paper p-[12%] shadow-[0_8px_0_var(--color-ink)] ${className}`}
    >
      {Array.from({ length: 9 }, (_, index) => {
        const row = Math.floor(index / 3) + 1;
        const column = (index % 3) + 1;
        const filled = pips.some(([r, c]) => r === row && c === column);

        return (
          <span
            key={index}
            className={`rounded-full ${filled ? "bg-ink" : "bg-transparent"}`}
          />
        );
      })}
    </div>
  );
}
