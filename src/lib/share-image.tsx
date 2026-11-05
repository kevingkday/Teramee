import { contrastText, type ShareCard } from './seo';

/**
 * Satori (next/og) only lays out flexbox. Every element sets display:flex.
 * No custom fonts and no remote images: that keeps the prerender inside
 * ImageResponse's edge bundle budget if a host ever runs it at request time.
 */
export function ProfileShareImage({ card }: { card: ShareCard }) {
  const footerText = contrastText(card.headerColor);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: card.backgroundColor
      }}
    >
      <div style={{ height: 28, width: '100%', display: 'flex', backgroundColor: card.accentColor }} />
      <div style={{ display: 'flex', flex: 1, padding: 48 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            backgroundColor: card.cardColor,
            border: `10px solid ${card.headerColor}`,
            borderRadius: 28,
            padding: 48
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              letterSpacing: 6,
              color: card.accentColor
            }}
          >
            TERAMEE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 64,
                lineHeight: 1.05,
                color: card.textColor
              }}
            >
              {card.displayName}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 18,
                fontSize: 36,
                color: card.headerColor
              }}
            >
              @{card.username}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              lineHeight: 1.35,
              color: card.textColor
            }}
          >
            {card.imageDescription}
          </div>
        </div>
      </div>
      <div
        style={{
          height: 72,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          backgroundColor: card.headerColor,
          color: footerText,
          fontSize: 26,
          paddingRight: 48
        }}
      >
        teramee.com/@{card.username}
      </div>
    </div>
  );
}

export function SiteShareImage() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#020617'
      }}
    >
      <div style={{ height: 28, width: '100%', display: 'flex', backgroundColor: '#ff2bd6' }} />
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 6, color: '#67e8f9' }}>
          YOUR SPACE ONLINE
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 92,
            color: '#ffffff',
            lineHeight: 1
          }}
        >
          Teramee
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 36,
            color: '#e2e8f0',
            maxWidth: 860
          }}
        >
          Your space, your sound, your rules.
        </div>
      </div>
      <div
        style={{
          height: 72,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          backgroundColor: '#083344',
          color: '#a5f3fc',
          fontSize: 26,
          paddingRight: 48
        }}
      >
        www.teramee.com
      </div>
    </div>
  );
}
