import { BaseProps } from '@/lib/utility-types';

export function FileIcon({ name, fill: color, text = "white", size = 40 }: BaseProps<{ name: string; fill: string, text?: string, size?: number }>) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 40 40">
      <path stroke="#D5D7DA" strokeWidth="1.5" d="M7.75 4A3.25 3.25 0 0 1 11 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 35 39.25H11A3.25 3.25 0 0 1 7.75 36z" />
      <path stroke="#D5D7DA" strokeWidth="1.5" d="M27 .5V8a4 4 0 0 0 4 4h7.5" />
      <rect width="32" height="16" x="1" y="18" fill={color} rx="2" />

      <path id="P" pathLength="10" d="M4 27h25" stroke="transparent" />
      <text font-weight="bold">
        <textPath href="#P" startOffset="5.125" fill={text} text-anchor="middle" dominant-baseline="middle" font-size="10px" text-length="24">
          {name}
        </textPath>
      </text>
    </svg>
  );
}
