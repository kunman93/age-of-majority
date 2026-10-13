import FamilySection from './FamilySection'
import { families } from './families'

function App() {
  return (
    <main>
      <h1 className="text-3xl font-bold">Happy 18th Birthday, Sara!</h1>
      <p>
        Today you come of age. This card gathers wishes from your family, near
        and far, to celebrate you and everything ahead of you. Scroll on and
        read what they have to say.
      </p>
      {families.map((family, index) => (
        <FamilySection key={index} family={family} />
      ))}
    </main>
  )
}

export default App
