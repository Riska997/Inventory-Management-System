# Inventory Management System — Web Version

This website recreates the main functions of the existing Java Swing Inventory Management System by Prisca Mulishi.

## Files
- `index.html`: webpage layout
- `style.css`: responsive presentation
- `app.js`: Add, Update, Delete, Clear, table rendering, and basic input validation

## Run locally
Open `index.html` in a browser, or open the folder in IntelliJ IDEA and right-click `index.html` → **Open in Browser**.

## Publish with GitHub Pages
1. Create a new public GitHub repository named `inventory-management-website`.
2. Upload these three website files to the root of the repository.
3. In **Settings → Pages**, set **Build and deployment** to **Deploy from a branch**, branch **main**, and folder **/(root)**.
4. After GitHub finishes publishing, the address should follow the form:
   `https://riska997.github.io/inventory-management-website/`

The URL is a proposed address, **not** a confirmed live deployment.

## Important
This is a **web adaptation**, not Java Swing running inside a browser. The original Java desktop program remains unchanged. Data is stored in browser `localStorage`, so it is separate for each visitor and browser; this is appropriate for a portfolio demonstration, not a shared production stock database.
