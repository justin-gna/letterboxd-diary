import { LetterboxdDiary } from "letterboxd-diary";

const API_URL = import.meta.env.VITE_API_URL as string;
const NAME = import.meta.env.VITE_NAME as string;

function App() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>

      <h2 style={{ color: "#eee", marginBottom: "1.5rem" }}>List</h2>
      <LetterboxdDiary apiUrl={API_URL} name={NAME} count={4} layout="list" />

      <h2 style={{ color: "#eee", margin: "2.5rem 0 1.5rem" }}>Grid</h2>
      <LetterboxdDiary apiUrl={API_URL} name={NAME} count={6} layout="grid" />

      <h2 style={{ color: "#eee", margin: "2.5rem 0 1.5rem" }}>Carousel</h2>
      <LetterboxdDiary apiUrl={API_URL} name={NAME} count={8} layout="carousel" />
    </div>
  );
}

export default App;
