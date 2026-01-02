import bronzePlacardSvg from '../assets/bronze-placard.svg';

interface BronzePlacardProps {
  size?: number;
  style?: React.CSSProperties;
}

export function BronzePlacard({ size = 64, style }: BronzePlacardProps) {
  return (
    <img
      src={bronzePlacardSvg}
      alt="placard"
      width={size}
      height={size * (94 / 120)} // Maintain aspect ratio (120x94 original)
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
    />
  );
}
