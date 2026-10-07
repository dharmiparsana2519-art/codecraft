"""Local preview server with caching turned off, so edits show up on every reload.
    python3 tools/serve.py [port]"""
import http.server, os, sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1]) if len(sys.argv) > 1 else 8765), NoCache).serve_forever()
