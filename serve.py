# Local dev server for TamaPet: like `python -m http.server`, but tells the browser to re-check every file
# (Cache-Control: no-cache), so changes to the JS modules show up on a normal reload.
# Run:  python serve.py   →  http://localhost:8080/
import functools
import http.server
import os

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.glb': 'model/gltf-binary'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

if __name__ == '__main__':
    root = os.path.dirname(os.path.abspath(__file__))
    handler = functools.partial(NoCacheHandler, directory=root)
    with http.server.ThreadingHTTPServer(('', 8080), handler) as httpd:
        print('TamaPet on http://localhost:8080/')
        httpd.serve_forever()
