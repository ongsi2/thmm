import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1a1a1a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Geometric shapes - overlapping squares */}
        <div
          style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            background: '#10b981',
            transform: 'rotate(45deg)',
            top: '6px',
            left: '6px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            background: '#059669',
            transform: 'rotate(45deg)',
            bottom: '8px',
            right: '8px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            border: '2px solid #10b981',
            transform: 'rotate(45deg)',
            top: '12px',
            right: '10px',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
