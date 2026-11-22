# ORBIT — Your Interactive 3D Universe

ORBIT is a browser-based 3D planetary explorer built with **Three.js**, JavaScript, HTML, and CSS. It is designed as a portfolio-ready interactive experience rather than a static space-themed landing page.

## Features

- Real-time 3D scene with a starfield, glowing Sun, and eight orbiting planets
- Click a planet or choose it from the planet selector to inspect it
- Planet information panel with type, orbital distance, day length, and moon count
- Drag to rotate, scroll to zoom, and use the camera controls
- Pause/resume the simulation and adjust orbital speed
- Search for planets by name
- Cinematic full-screen mode
- Responsive layout for desktop and mobile

## Run locally

This project uses browser ES modules and an import map, so run it through a local web server rather than opening `index.html` directly.

### Option 1: VS Code Live Server
1. Extract the project ZIP.
2. Open the `ORBIT` folder in VS Code.
3. Install the **Live Server** extension if you do not already have it.
4. Right-click `index.html` and choose **Open with Live Server**.

### Option 2: Python
If Python is installed, open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy with GitHub Pages

1. Create a **public** repository named `ORBIT` on GitHub.
2. Extract this project and open the extracted `ORBIT` folder.
3. Upload `index.html`, `README.md`, and the `src` folder to the repository root. Do not upload the ZIP as the only repository file.
4. Commit the files to the `main` branch.
5. In the repository, open **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select branch **main** and folder **/(root)**, then click **Save**.
8. Wait for the Pages deployment to finish. Your site will be available at:
   `https://YOUR-USERNAME.github.io/ORBIT/`

## Tech stack

- [Three.js](https://threejs.org/) — 3D rendering and scene graph
- JavaScript ES modules — simulation and interaction logic
- HTML5 + CSS3 — interface and responsive layout
- GitHub Pages — static hosting

## Project structure

```text
ORBIT/
├── index.html
├── README.md
└── src/
    ├── main.js
    └── style.css
```

## Notes

- Three.js and OrbitControls are loaded from jsDelivr, so an internet connection is required when running the site.
- The planetary sizes, orbital distances, and speeds are intentionally stylized for visual clarity. They are not to scale.
- Planet moon counts are reference values and can change as discoveries are confirmed.
