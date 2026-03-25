import { forwardRef } from 'react';

const NeonCanvas = forwardRef(function NeonCanvas({ width, height }, ref) {
  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
});

export default NeonCanvas;