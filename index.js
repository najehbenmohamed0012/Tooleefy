/**
 * Tooleefy - Hostinger Node.js App Starter Wrapper & Vercel Entry Point
 * 
 * Hostinger's Node.js application manager usually requires a startup file (like index.js) 
 * to reside at the root of your application. This file acts as a clean proxy loader 
 * that boots our production bundle seamlessly, and serves as the primary export entry 
 * for Vercel's Serverless Function engine.
 */

// Load the compiled high-efficiency production server bundle
import serverModule from "./dist/server.cjs";

// Safely extract the Express application instance
const app = serverModule.default || serverModule;

export default app;
