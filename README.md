<p align="center">
  <img src="logo.svg" alt="Logo">
</p>

# GitGrove 🌳

![Node.js Version](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19%2B-61DAFB?logo=react&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-v4%2B-00bcff?logo=tailwind-css&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16%2B-000000?logo=nextdotjs&logoColor=white)
[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
![License](https://img.shields.io/badge/License-MIT-yellow?logo=open-source-initiative&logoColor=white)

**GitGrove** is an interactive Git explainer built with [Next.js](https://nextjs.org). It teaches Git from your first commit to its object model through animated, step-through diagrams — with a refined black-and-white aesthetic, sharp corners, monospace typography, and a live badge tracking the current stable Git release.

---

## Features 🌟

- **Interactive Diagrams**: Step-through SVG diagrams for staging, branching, merge vs. rebase, reset modes, and the object model.
- **Progressive Guide**: 29 sections across four tiers — Beginner, Intermediate, Advanced, and Internals — each with commands and a gotchas callout.
- **Live Git Version**: The current stable release is fetched from the `git/git` tags and cached daily, with a bundled fallback.
- **MDX Content**: Section prose lives in editable `.mdx` files driven by a single ordered index.
- **Custom Animations**: Smooth transitions that respect `prefers-reduced-motion`.
- **Responsive Design**: Fully optimized for desktops, tablets, and mobile devices.
- **Theming**: Built-in light and dark mode toggle.
- **Optimized Fonts**: Includes `Geist Pixel Square` and `Geist Mono` fonts, optimized via `next/font`.
- **Effortless Deployment**: Designed for seamless deployment on Vercel.

---

## Getting Started 🚀

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v22 or later.
- **Package Manager**: `npm`

---

### Installation ⚙️

1. Clone the repository:

   ```bash
   git clone https://github.com/tejastn10/git-grove.git
   cd git-grove
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000` to see GitGrove in action.

---

### Deployment 📦

GitGrove is designed to be deployed effortlessly on Vercel.

For more deployment options, check out the Next.js [Deployment Documentation](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

---

### Project Structure 📂

```bash
git-grove/
├── public/                 # Static assets like images, fonts, and favicon
├── src/                    # Main source code directory
│   ├── app/                # Next.js App directory (routing, layouts, and pages)
│   ├── components/         # Reusable React components
│   │   ├── diagrams/       # Interactive Git diagrams (one component each)
│   │   ├── guide/          # Guide table of contents and cheat sheet
│   │   ├── history/        # History timeline
│   │   └── ...             # animated, icons, theme, ui
│   ├── containers/         # Page-specific container components (e.g., TopNavbar)
│   ├── content/            # Section MDX, the section index, cheat sheet, history data
│   │   └── git/            # One .mdx file per guide section + sections.ts
│   ├── data/               # Site configuration
│   ├── lib/                # Content pipeline and the live Git-version lookup
│   └── utils/              # Utility functions for common operations
├── next.config.ts          # Next.js configuration file
├── tsconfig.json           # TypeScript configuration file
├── postcss.config.mjs      # PostCSS configuration file for TailwindCSS
├── .commitlintrc.yml       # Commitlint configuration to enforce commit message conventions
├── biome.json              # BiomeJS configuration for linting and code quality
├── .nvmrc                  # Node version file to specify the Node.js version
├── package.json            # Dependencies and npm/yarn scripts
├── LICENSE.md              # License for the project
└── README.md               # Project documentation
```

---

## License 📜

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

---

## Acknowledgments 🙌

- Named **GitGrove** — a grove being a small wood, a nod to the branching trees you build with Git.
- Git facts are summarized from public sources; see the History page for links to the authoritative ones.
- Built with ❤️ and Next.js.
