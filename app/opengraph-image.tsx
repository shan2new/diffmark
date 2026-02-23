import { ImageResponse } from 'next/og'

export const alt = 'Markos - Free Online Markdown Editor'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'hsl(30, 20%, 99%)',
        }}
      >
        {/* Favicon-style badge (matches public/icon.svg) */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            backgroundColor: 'hsl(30, 20%, 99%)',
            border: '3px solid hsl(30, 8%, 8%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 56,
              fontWeight: 600,
              color: 'hsl(30, 8%, 8%)',
            }}
          >
            m.
          </span>
        </div>
        <span
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 72,
            fontWeight: 600,
            color: 'hsl(30, 8%, 8%)',
            marginBottom: 16,
          }}
        >
          Markos
        </span>
        <span
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 28,
            color: 'hsl(30, 8%, 35%)',
          }}
        >
          Free online markdown editor with live preview
        </span>
      </div>
    ),
    { ...size }
  )
}
