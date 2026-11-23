/* eslint-disable i18next/no-literal-string -- the wordmark is the brand name */
const JarvisTextLogo = ({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <svg
      width={width || 320}
      height={height || 60}
      className={className}
      viewBox="0 0 320 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="160"
        y="45"
        textAnchor="middle"
        className="fill-text"
        style={{
          fontSize: "48px",
          fontWeight: 700,
          fontFamily:
            "'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif",
          letterSpacing: "6px",
        }}
      >
        J.A.R.V.I.S.
      </text>
    </svg>
  );
};

export default JarvisTextLogo;
