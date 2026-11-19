"""Genera public/brand/* a partir de los recortes del logo de LaLiga Lytics.

Uso: python scripts/make-brand-assets.py <logo-full.png> <logo-mark.png> <app-icon.png>
Los originales son opacos (fondo navy): se convierte la luminancia del fondo en transparencia para que
los logos floten sobre cualquier superficie oscura sin dibujar un rectángulo.
"""
import sys
from pathlib import Path
from PIL import Image, ImageChops

OUT = Path(__file__).resolve().parent.parent / 'public' / 'brand'
LO, HI = 30, 120  # umbral de máximo canal: por debajo = fondo (transparente), por encima = opaco


def key_out_background(path: Path) -> Image.Image:
    img = Image.open(path).convert('RGB')
    r, g, b = img.split()
    peak = ImageChops.lighter(ImageChops.lighter(r, g), b)
    alpha = peak.point(lambda v: int(max(0, min(1, (v - LO) / (HI - LO))) * 255))
    res = img.convert('RGBA')
    res.putalpha(alpha)
    bbox = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    if bbox:
        pad = 6
        l, t, rr, bb = bbox
        res = res.crop((max(0, l - pad), max(0, t - pad), min(res.width, rr + pad), min(res.height, bb + pad)))
    return res


def main(full: str, mark: str, icon: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    Image.open(full).convert('RGB').save(OUT / 'logo-source.png')
    key_out_background(Path(full)).save(OUT / 'logo-full.png')
    key_out_background(Path(mark)).save(OUT / 'logo-mark.png')
    app = Image.open(icon).convert('RGB')
    app.save(OUT / 'app-icon.png')
    app.resize((64, 64), Image.LANCZOS).save(OUT / 'favicon-64.png')
    app.resize((192, 192), Image.LANCZOS).save(OUT / 'icon-192.png')


if __name__ == '__main__':
    main(*sys.argv[1:4])
