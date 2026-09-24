export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve the HTML page for the root path
    if (url.pathname === '/') {
      return new Response(getHTML(), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    // Proxy the game file
    if (url.pathname === '/game') {
      const gameUrl = 'https://cdn.jsdelivr.net/gh/awaiblecomponent/575@main/1.xml';

      try {
        const response = await fetch(gameUrl, {
          headers: {
            // Some CDNs require a browser-like User-Agent to return the file
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (!response.ok) {
          return new Response(`Failed to fetch game: ${response.statusText}`, { status: response.status });
        }

        // Create a new response with the body
        const newResponse = new Response(response.body, response);
        
        // Add CORS headers and FORCE the browser to render it as HTML
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Content-Type', 'text/html;charset=UTF-8');

        return newResponse;
      } catch (error) {
        return new Response(`Error fetching game: ${error.message}`, { status: 500 });
      }
    }

    // Return 404 for all other paths
    return new Response('Not Found', { status: 404 });
  },
};

function getHTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>They Are Coming</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"><\/script>
  <style>
    body, html { margin: 0; padding: 0; overflow: hidden; height: 100%; background: #000; }
    #container { position: relative; width: 100%; height: 100%; }
    iframe { width: 100%; height: 100%; border: none; }
    .play-button {
      padding: 20px 40px; background: #000; color: #fff;
      border: 2px solid #4a148c; border-radius: 10px;
      font: bold 24px Arial; cursor: pointer;
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%); z-index: 1001;
    }
  </style>
</head>
<body>
  <div id="container">
    <iframe id="fr" src="about:blank" allowfullscreen></iframe>
    <button class="play-button" type="button" onclick="PlayTo()">CLICK TO PLAY</button>
  </div>
  <script>
    function PlayTo() {
      const iframe = document.getElementById("fr");
      const button = document.querySelector(".play-button");

      // Point the iframe to the proxied game URL
      iframe.src = "/game";

      // Show the iframe and hide the button once the game starts loading
      iframe.onload = () => {
        iframe.style.display = "block";
        button.style.display = "none";
      };

      // Handle any loading errors
      iframe.onerror = () => {
        alert("Failed to load the game. Please try again.");
        button.style.display = "block";
        iframe.style.display = "none";
      };
    }
  <\/script>
</body>
</html>`;
}
