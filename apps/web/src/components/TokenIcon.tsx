import tokenSvg from '../assets/token.svg';

interface TokenIconProps {
  size?: number;
  style?: React.CSSProperties;
}

export function TokenIcon({ size = 24, style }: TokenIconProps) {
  return (
    <img
      src={tokenSvg}
      alt="token"
      width={size}
      height={size}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
    />
  );
}
