import { useMemo, useId } from "react";
import "./SimpleLineChart.css";

interface LineSeries {
  data: number[];
  label: string;
  color: string;
}

interface SimpleLineChartProps {
  xLabels: (string | number)[];
  series: LineSeries[];
  width?: number;
  height?: number;
  title?: string;
}

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 320;
const PADDING = 48;

export default function SimpleLineChart({
  xLabels,
  series,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  title = "Gráfico de linhas",
}: SimpleLineChartProps) {
  const chart = useMemo(() => {
    if (!series.length || !xLabels.length) {
      return null;
    }

    const totalPoints = xLabels.length;
    const values = series.flatMap((item) => item.data.slice(0, totalPoints));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    const innerWidth = width - PADDING * 2;
    const innerHeight = height - PADDING * 2;

    const projectX = (index: number) =>
      totalPoints === 1
        ? width / 2
        : PADDING + (index / (totalPoints - 1)) * innerWidth;

    const projectY = (value: number) =>
      height - PADDING - ((value - minValue) / range) * innerHeight;

    const polylines = series.map((serie) => ({
      label: serie.label,
      color: serie.color,
      points: serie.data.slice(0, totalPoints).map((value, index) => ({
        x: projectX(index),
        y: projectY(value),
        value,
      })),
    }));

    const stepApprox = range / 4;
    const step = stepApprox <= 1 ? 1 : Math.ceil(stepApprox / 5) * 5;
    const ticks: number[] = [];
    const start = Math.floor(minValue / step) * step;
    for (let value = start; value <= maxValue; value += step) {
      ticks.push(value);
    }
    if (!ticks.includes(maxValue)) {
      ticks.push(maxValue);
    }

    return { polylines, projectX, minValue, maxValue, range, ticks };
  }, [height, series, width, xLabels]);

  const titleId = useId();
  const titleElementId = `${titleId}-title`;

  return (
    <figure className="simple-line-chart">
      <svg
        role="img"
        aria-labelledby={titleElementId}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
      >
        <title id={titleElementId}>{title}</title>
        <desc>{series.map((serie) => `${serie.label}: ${serie.data.join(", ")}`).join(" | ")}</desc>

        {/* Eixo X */}
        <line
          x1={PADDING}
          x2={width - PADDING / 2}
          y1={height - PADDING}
          y2={height - PADDING}
          stroke="#d1d5db"
          strokeWidth={1}
        />

        {/* Labels do eixo X */}
        {xLabels.map((label, index) => (
          <text
            key={`${label}-${index}`}
            x={chart ? chart.projectX(index) : width / 2}
            y={height - PADDING + 20}
            fontSize={14}
            textAnchor="middle"
            fill="#6b7280"
          >
            {label}
          </text>
        ))}

        {/* Grid horizontal e labels do eixo Y */}
        {chart?.ticks.map((tick) => {
          const ratio = chart.range ? (tick - chart.minValue) / chart.range : 0;
          const y = height - PADDING - ratio * (height - PADDING * 2);
          return (
            <g key={`tick-${tick}`}>
              <line x1={PADDING} x2={width - PADDING / 2} y1={y} y2={y} stroke="#f3f4f6" strokeWidth={1} />
              <text x={PADDING - 12} y={y + 4} textAnchor="end" fontSize={12} fill="#6b7280">
                {tick}
              </text>
            </g>
          );
        })}

        {/* Séries */}
        {chart?.polylines.map((serie) => (
          <g key={serie.label}>
            <polyline
              points={serie.points.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="none"
              stroke={serie.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {serie.points.map((point, index) => (
              <g key={`${serie.label}-point-${index}`}> 
                <circle cx={point.x} cy={point.y} r={4} fill={serie.color} />
              </g>
            ))}
          </g>
        ))}
      </svg>

      {chart && (
        <figcaption className="simple-line-chart__legend">
          {chart.polylines.map((serie) => (
            <span key={serie.label} className="simple-line-chart__legend-item">
              <span className="legend-dot" aria-hidden style={{ backgroundColor: serie.color }} />
              {serie.label}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
