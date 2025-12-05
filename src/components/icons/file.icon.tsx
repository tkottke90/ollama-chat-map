import { BaseProps } from '@/lib/utility-types';

export type FileIconProps = {
  name: string;
  fill: string;
  text?: string;
  size?: number;
}

export function FileIcon({ name, fill: color, size = 40 }: BaseProps<FileIconProps>) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 40 40">
      <path className="stroke-(--file-icon-stroke,white)" strokeWidth="1.5" d="M7.75 4A3.25 3.25 0 0 1 11 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 35 39.25H11A3.25 3.25 0 0 1 7.75 36z" />
      <path className="stroke-(--file-icon-stroke,white)" strokeWidth="1.5" d="M27 .5V8a4 4 0 0 0 4 4h7.5" />
      <rect width="32" height="16" x="1" y="18" fill={color} rx="2" />

      <path id="P" pathLength="10" d="M4 27h25" stroke="transparent" />
      <text font-weight="bold">
        <textPath href="#P" startOffset="5.125" className="fill-(--file-icon-fill,#fff)" text-anchor="middle" dominant-baseline="middle" font-size="10px" text-length="24">
          {name}
        </textPath>
      </text>
    </svg>
  );
}
