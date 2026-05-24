
import heroImg from './assets/hero.png'
import './App.css'

function App() {

  return (
      <section id="center">
        <img src={heroImg} alt="Hero" />
        <h1>Welcome to the File Analyzer</h1>
        <p>Upload and analyze your files with ease.</p>
        <button>Get Started</button>
      </section>
    
  )
}

export default App
