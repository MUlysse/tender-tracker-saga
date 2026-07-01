import base64
svg = """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect x='6' y='6' width='108' height='108' rx='24' fill='#ffffff' stroke='#000000' stroke-width='12'/><circle cx='60' cy='60' r='24' fill='#A51C30'/></svg>"""
print('data:image/svg+xml;base64,' + base64.b64encode(svg.encode('utf-8')).decode('ascii'))
