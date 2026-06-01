/**
 * Tooleefy - Hostinger Node.js App Starter Wrapper
 * 
 * Hostinger's Node.js application manager usually requires a startup file (like index.js) 
 * to reside at the root of your application. This file acts as a clean proxy loader 
 * that boots our production bundle seamlessly.
 */

// Load the compiled high-efficiency production server bundle
require("./dist/server.cjs");
