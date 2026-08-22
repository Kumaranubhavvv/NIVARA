import http.server
import socketserver
import os
import sys

PORT = 3000
DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Fallback to index.html for SPA routes
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            self.path = "/index.html"
        return super().do_GET()

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving {DIRECTORY} at http://localhost:{PORT}")
        sys.stdout.flush()
        httpd.serve_forever()
