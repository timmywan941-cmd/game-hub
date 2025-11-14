# Neon Arcade (Unblocked Games Hub)

Neon Arcade is a single-page bundle of HTML, CSS, and JavaScript games that can be embedded inside Google Sites (or any other static hosting) to provide an unblocked arcade experience for Chromebooks.

## Features

- **Self-contained bundle** – no external network requests, so the experience stays unblocked.
- **Responsive layout** – hero, feature cards, and modal launcher adapt to Google Sites iframes or standalone browsers.
- **Searchable library** – quickly filter available titles inside the launcher toolbar.
- **Local score tracking** – each game stores the best score in `localStorage` on the device.
- **Three original canvas games** – Retro Snake, Neon Paddle, and Meteor Dodge.

## Repository structure

```
.
├── index.html   # Landing page and modal container
├── style.css    # Theme and responsive styles
├── script.js    # Game launcher + canvas games
└── README.md    # Project documentation
```

## Running locally

1. Clone this repository.
2. Serve the files through any static file server, e.g.

   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in a browser and enjoy the games.

## Embedding in Google Sites

1. Open your Google Site and go to the page where you want the arcade.
2. Click **Insert → Embed → Embed Code**.
3. Paste the contents of `index.html` (or upload the file via **Embed → By URL** after hosting).
4. Publish the site; Google Sites provides the public URL.

Because the games run entirely in-browser, there is no backend to deploy.

## Customization tips

- Add new games by extending the `gameLibrary` array in `script.js` and providing a corresponding `init` function.
- Adjust the accent colors or typography in `style.css` to match your school branding.
- Replace hero text or feature copy in `index.html` to personalize the presentation.

## License

Released under the MIT License. Feel free to remix for educational purposes.
