import { splitSentences } from './splitSentences'

// The markup is the final state: the full text, no cursor. Assistive technology
// reads the full text from the first span. The aria-hidden grid is what the
// typewriter animates: one line per sentence, stacked in a single cell so the
// space of the longest sentence is reserved.
function TypedIntro({ text }: { text: string }) {
  return (
    <p
      data-intro
      data-typed="done"
      className="text-xl leading-relaxed sm:text-2xl"
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="grid">
        <span data-full-text className="col-start-1 row-start-1">
          {text}
        </span>
        {splitSentences(text).map((sentence, index) => (
          <span
            key={index}
            data-sentence-line
            className="col-start-1 row-start-1 hidden"
          >
            <span data-typed-text></span>
            <span data-cursor className="relative opacity-0">
              <span className="bg-ember absolute bottom-[-0.2em] left-0 h-[1.1em] w-[0.1em]" />
            </span>
            <span data-untyped-text className="opacity-0">
              {sentence}
            </span>
          </span>
        ))}
      </span>
    </p>
  )
}

export default TypedIntro
