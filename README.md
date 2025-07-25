# [OstrichDB](ostrichdb.com)
The Database For Everyone

## Getting Started: 
1. Ensure you have the [Open-OstrichDB](https://github.com/Archetype-Dynamics/Open-OstrichDB) repo is on your machine and the server is running.
2. Create a [Clerk](https://clerk.com/) Account
3. Create a `.env` in the root of this project and add the following:
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

VITE_API_URL=http://localhost:8042
``` 
4. Run `yarn install` or `yarn`
5. Run `yarn dev`

*** Note: Natural language queries are disabled in this version of the software ***


## Tech Stack
- Framework/Library: React
- Languages: Typescript/Javascript
- UI: MantineUI, TailwindCSS, Lucide-React(icons)
- Testing: Jest
- Package Manager: Yarn
- Backend: Open-OstrichDB
