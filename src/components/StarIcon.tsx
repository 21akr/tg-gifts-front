interface Props {
  size?: number;
}

export function StarIcon({ size = 14 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l2.39 7.36H22l-6.19 4.5L18.18 21 12 16.5 5.82 21l2.37-7.14L2 9.36h7.61L12 2z" />
    </svg>
  );
}
