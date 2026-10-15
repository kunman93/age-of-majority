import { ornamentLayout, type Piece, type Placement } from './ornamentLayout'
import { Cosmos, Round } from './pieces/Blossom'
import Dust from './pieces/Dust'
import Stem from './pieces/Stem'

const drawPiece = (piece: Piece) => {
  switch (piece.piece) {
    case 'stem':
      return <Stem variant={piece.variant} />
    case 'cosmos':
      return <Cosmos tone={piece.tone} />
    case 'round':
      return <Round tone={piece.tone} />
    case 'dust':
      return <Dust seed={piece.seed} />
  }
}

// mb-0 keeps a parent's space-y margin from shrinking the layer. The layer is
// as wide as the viewport so the compositions hug the screen edges, and
// `main` clips whatever bleeds off them
/** Botanical compositions framing the sides of the positioned parent */
function Ornaments({
  placement,
  className = '',
}: {
  placement: Placement
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      data-ornaments
      className={`pointer-events-none absolute inset-y-0 left-[calc(50%-50vw)] mb-0 w-screen ${className}`}
    >
      {ornamentLayout[placement].map(
        ({ side, anchor, height, bleed, pieces }) => (
          <div
            key={side}
            className="absolute aspect-3/4"
            style={
              {
                '--h': `clamp(8rem, max(${height}vw, min(${height * 2.6}vw, 30svh)), 40rem)`,
                height: 'var(--h)',
                [anchor]: 'calc(var(--h) * -0.18)',
                [side]: `calc(var(--h) * -0.75 * ${bleed})`,
              } as React.CSSProperties
            }
          >
            {pieces.map((piece, index) => (
              <div
                key={index}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${piece.x}%`,
                  top: `${piece.y}%`,
                  width: `${piece.size}%`,
                  rotate: `${piece.rotation}deg`,
                }}
              >
                {drawPiece(piece)}
              </div>
            ))}
          </div>
        ),
      )}
    </div>
  )
}

export default Ornaments
