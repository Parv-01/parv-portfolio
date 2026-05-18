# The Ultimate Deployment & Maintenance Guide

This document is your roadmap for taking your portfolio from a local folder on your computer to a globally accessible, automated, and professional website.

Because you are using a modern Vite + React + TypeScript stack (often called the Jamstack), this deployment process is 100% free forever, highly scalable, and completely automated.

---

## Phase 1: Securing Your Code with GitHub (Local to Cloud)

Right now, your code only exists on your computer. If your hard drive crashes, you lose your portfolio. We need to push this to GitHub.

### Step 1: Initialize Git locally
Open your terminal inside your project folder (`parv-portfolio-new`) and run:
```bash
git init
git add .
git commit -m "Initial commit: Production-ready portfolio"
```

### Step 2: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Name the repository something like `portfolio` or `parv.is-a.dev`.
3. Keep it **Public** (this is important if you want to use free domains later, and it acts as your resume for recruiters).
4. **Do NOT** check "Add a README file" or ".gitignore" (you already have these locally).
5. Click **Create repository**.

### Step 3: Push your local code to GitHub
GitHub will show you a page with some commands. Look for the block titled *"…or push an existing repository from the command line"* and run those commands in your terminal:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/portfolio.git
git branch -M main
git push -u origin main
```
*Your code is now safe in the cloud!*

---

## Phase 2: Choosing the Host (Netlify vs. GitHub Pages)

You asked whether to use **Netlify** or **GitHub Pages**. Both are free forever, but here is the professional breakdown:

| Feature | Netlify (Winner 🏆) | GitHub Pages |
| :--- | :--- | :--- |
| **Setup Speed** | 1 Minute | 5-10 Minutes (requires GitHub Actions) |
| **Routing (React Router)**| Native Support (using your `netlify.toml`) | Clunky (often 404s on refresh without hacks) |
| **Global Speed (CDN)** | Extremely Fast (Edge network) | Fast |
| **Custom Domains** | Flawless, auto-renews SSL | Good, but SSL can occasionally be finicky |
| **Deploy Previews** | Yes (Creates a secret link for every PR) | No |

**Verdict:** Use **Netlify**. Your project already has a flawless `netlify.toml` file sitting in the root directory. It was literally architected to be deployed on Netlify.

---

## Phase 3: Deploying to Netlify (The "Set It and Forget It" Setup)

1. Go to [Netlify.com](https://www.netlify.com/) and sign up using your **GitHub account**.
2. Once logged in, click **"Add new site"** > **"Import from an existing project"**.
3. Choose **GitHub** as your Git provider.
4. Search for and select your newly created `portfolio` repository.
5. **The Magic Step:** Netlify will automatically read your `package.json` and `netlify.toml`. It will pre-fill the build settings:
   * **Build command:** `npm run build`
   * **Publish directory:** `dist`
6. Click **Deploy site**.

Within 60 seconds, your site will be live on a URL like `https://parv-portfolio-12345.netlify.app`. 

*From this point forward, anytime you `git push` a change (like updating `projects.ts`), Netlify will automatically rebuild and update your live website!*

---

## Phase 4: Getting a Custom Domain (`parv.is-a.dev`)

To look like a true professional, you should ditch the `.netlify.app` ending and get your own domain. The `is-a.dev` project provides free subdomains for developers for lifetime.

### Step 1: Claim your domain
1. Go to the [is-a.dev GitHub repository](https://github.com/is-a-dev/register).
2. Fork the repository.
3. In your forked repo, go to the `domains` folder and create a file named `parv.json`.
4. Add the following JSON to the file, pointing it to your Netlify URL (make sure you remove the `https://` from the Netlify URL):
```json
{
  "description": "Portfolio of Parv Agarwal",
  "repo": "https://github.com/YOUR_GITHUB_USERNAME/portfolio",
  "owner": {
    "username": "YOUR_GITHUB_USERNAME",
    "email": "your-email@example.com"
  },
  "record": {
    "CNAME": "parv-portfolio-12345.netlify.app"
  }
}
```
5. Create a Pull Request (PR) to the main `is-a.dev` repository. Within a day or two, a maintainer will merge it, and `parv.is-a.dev` will be yours.

### Step 2: Connect it to Netlify
1. Go to your Netlify Dashboard.
2. Go to **Domain management** > **Add custom domain**.
3. Type in `parv.is-a.dev` and click **Verify**.
4. Netlify will ask you to configure DNS. Since you set up the CNAME in the `is-a.dev` repo, it will automatically connect!
5. **CRITICAL:** Scroll down to the HTTPS/SSL section and click **Provision Certificate**. Netlify will give you a free Let's Encrypt SSL certificate so your site says "Secure" (padlock icon).

---

## Phase 5: Future Maintenance 

Your entire website is now a **CMS (Content Management System) powered by Git**.

**How to add a new project:**
1. Open `src/content/projects.ts` locally.
2. Add the project.
3. Run `git add . && git commit -m "Added new project" && git push`
4. The live site updates in 1 minute.

**How to add a new blog post:**
1. Create `my-new-post.mdx` in `src/content/blog/`.
2. Run `git add . && git commit -m "Added blog post" && git push`
3. The live site updates in 1 minute.

You never have to log into Netlify again. Your code editor and terminal are your entire publishing workflow.
