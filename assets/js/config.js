/* =============================================================================
 *  PERSONALIZE YOUR PORTFOLIO HERE
 *  Everything on the site reads from this one object. Edit the values below,
 *  commit & push, and GitHub Pages redeploys automatically.
 * ========================================================================== */

window.PORTFOLIO_CONFIG = {
  // --- Identity -------------------------------------------------------------
  githubUsername: "mr-ionator",     // used for live heatmap + projects + avatar
  name: "mr-ionator",               // TODO: change to your real display name
  role: "Software Engineer",        // headline under your name
  // Titles that cycle with a scramble effect under your name (edit freely):
  roles: ["Software Engineer", "Android Developer", "Problem Solver", "Builder of Things"],
  tagline:
    "I build things across mobile, web and systems — Android apps, tooling, and everything in between.",

  // --- About ----------------------------------------------------------------
  about: [
    "I'm a developer who likes turning rough ideas into shipped products. My work spans " +
      "Android (Kotlin & Jetpack Compose), web front-ends, Python tooling, and a bit of " +
      "infrastructure with Terraform and Docker.",
    "I care about clean architecture, snappy UX, and building things that are actually useful. " +
      "This site pulls my real GitHub activity live, so it's always up to date.",
  ],

  // Location & availability (leave blank "" to hide) ------------------------
  location: "",
  availability: "Open to opportunities",

  // --- Skills ---------------------------------------------------------------
  // Grouped however you like. Add / remove freely.
  skills: {
    Languages: ["Kotlin", "Python", "TypeScript", "JavaScript", "C++", "HTML", "CSS", "Shell"],
    "Frameworks & Tools": ["Jetpack Compose", "Android SDK", "Node.js", "React"],
    "Infra & DevOps": ["Docker", "Terraform", "Git", "Linux", "GitHub Actions"],
  },

  // --- Contact / socials ----------------------------------------------------
  // Leave a value as "" and that link is hidden automatically.
  email: "siddh05nov@gmail.com",
  socials: {
    github: "https://github.com/mr-ionator",
    linkedin: "",   // e.g. "https://linkedin.com/in/your-handle"
    twitter: "",    // e.g. "https://twitter.com/your-handle"
    website: "",    // e.g. "https://your-domain.com"
  },

  // --- Projects -------------------------------------------------------------
  // Projects are pulled LIVE from GitHub. Tune what shows here:
  projects: {
    maxShown: 6,               // how many cards to show initially
    excludeRepos: ["mr-ionator", "mr-ionator.github.io"], // hide these repos
    excludeForks: true,        // hide forked repos
    // Pin specific repos to the top (exact repo names), in order:
    pinned: ["price-tracker", "ingredient-iq", "UE-5-Qualcomm-upscaler"],
  },
};
