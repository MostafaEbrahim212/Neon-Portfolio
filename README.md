<div align="center">
  <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop" alt="Portfolio Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;">
  
  <h1>🚀 Interactive Developer Portfolio</h1>
  <p>A highly interactive, performance-optimized, and premium developer portfolio built with Vanilla Web Technologies.</p>

  <p>
    <a href="#features"><strong>✨ Features</strong></a> ·
    <a href="#tech-stack"><strong>💻 Tech Stack</strong></a> ·
    <a href="#architecture"><strong>🏗️ Architecture</strong></a> ·
    <a href="#installation"><strong>🚀 Installation</strong></a>
  </p>
</div>

---

## ✨ Features

- **Dynamic GitHub Integration:** Automatically fetches and displays real-time repositories, stars, and forks using the GitHub API.
- **Multilingual (i18n):** Full support for English (LTR) and Arabic (RTL) with dynamic font switching (Outfit & Cairo).
- **Interactive Floating Terminal:** A draggable, glassmorphic terminal that accepts commands (`whoami`, `skills`, `github`, `clear`) and fetches live data.
- **Premium Animations:** Complex scroll animations, magnetic buttons, custom cursors, and horizontal scrolling powered by **GSAP**.
- **Smooth Scrolling:** Buttery smooth scrolling experience powered by **Lenis**.
- **Micro-Interactions & Audio Feedback:** Custom Toast notification system with Web Audio API for satisfying micro-sounds (no heavy audio files).
- **Responsive & Mobile First:** Meticulously crafted to feel like a native mobile app on smaller screens.
- **3D Backgrounds:** Interactive WebGL background effects using **Vanta.js**.

## 💻 Tech Stack

This project deliberately avoids heavy frameworks (like React or Vue) to demonstrate mastery of core web technologies while achieving framework-level performance and modularity.

- **HTML5:** Semantic, accessible markup.
- **CSS3:** Modular architecture, CSS Variables, Glassmorphism, Flexbox/Grid.
- **JavaScript (ES6+):** Async/Await, Fetch API, DOM manipulation, Web Audio API.
- **GSAP:** Advanced timeline animations and ScrollTrigger.
- **Lenis:** Smooth scroll library.
- **Vanta.js / Three.js:** 3D interactive backgrounds.

## 🏗️ Architecture

The codebase follows a modular architecture, specifically dividing CSS into logical domains for maintainability.

```text
📁 Animated_Portfolio/
├── 📄 index.html          # Main Entry Point
├── 📄 data.json           # Localization & Content Data
└── 📁 assets/
    ├── 📁 css/            # Modular CSS Architecture
    │   ├── base.css       # Typography & Utilities
    │   ├── components.css # Buttons, Toast, Terminal, Loader
    │   ├── layout.css     # Nav, Footer
    │   ├── responsive.css # Media Queries
    │   ├── rtl.css        # Arabic Language Overrides
    │   ├── sections.css   # Hero, About, Projects, Skills
    │   └── variables.css  # Colors, Transitions, Variables
    └── 📁 js/
        └── main.js        # Core Logic, GSAP, APIs, UI
```

## 🚀 Installation & Usage

Since this is a vanilla web project, no `npm install` or build steps are required. However, for features like the `fetch` API (GitHub Repos and `data.json`) to work properly, you must serve the files via a local server.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MostafaEbrahim/Animated_Portfolio.git
   ```

2. **Open in VS Code:**
   ```bash
   cd Animated_Portfolio
   code .
   ```

3. **Run a Local Server:**
   - Install the **Live Server** extension in VS Code.
   - Right-click `index.html` and select **"Open with Live Server"**.
   - The portfolio will open at `http://127.0.0.1:5500`.

## 👨‍💻 Author

**Mostafa Ebrahim**  
*Backend & Full Stack Developer*
- GitHub: [@MostafaEbrahim212](https://github.com/MostafaEbrahim212)
- LinkedIn: [Mostafa Ebrahim](#)

---
<div align="center">
  <i>Built with passion, clean code, and countless cups of coffee ☕</i>
</div>
