const JarvisIcon = ({
  width,
  height,
}: {
  width?: number | string;
  height?: number | string;
}) => (
  <svg
    width={width || 40}
    height={height || 40}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer ring */}
    <circle cx="50" cy="50" r="46" fill="none" stroke="#4fc3f7" strokeWidth="4" opacity="0.8" />
    {/* Middle ring */}
    <circle cx="50" cy="50" r="34" fill="none" stroke="#4fc3f7" strokeWidth="3" opacity="0.6" />
    {/* Inner glow */}
    <circle cx="50" cy="50" r="20" fill="#b3e5fc" opacity="0.9" />
    <circle cx="50" cy="50" r="14" fill="#e1f5fe" />
    {/* Arc segments */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
      <rect
        key={angle}
        x="48"
        y="6"
        width="4"
        height="10"
        rx="2"
        fill="#4fc3f7"
        opacity="0.7"
        transform={`rotate(${angle} 50 50)`}
      />
    ))}
  </svg>
);

export default JarvisIcon;
