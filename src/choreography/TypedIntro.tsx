// The markup is the final state: all text typed, no cursor. Assistive technology
// reads the full text from the first span; the aria-hidden spans are what the
// typewriter animates, and together they keep the full text in the layout.
function TypedIntro({ text }: { text: string }) {
  return (
    <p
      data-intro
      data-typed="done"
      className="text-xl leading-relaxed sm:text-2xl"
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        <span data-typed-text>{text}</span>
        <span data-cursor className="relative opacity-0">
          <span className="bg-ember absolute bottom-[-0.2em] left-0 h-[1.1em] w-[0.1em]" />
        </span>
        <span data-untyped-text className="opacity-0"></span>
      </span>
    </p>
  )
}

export default TypedIntro
