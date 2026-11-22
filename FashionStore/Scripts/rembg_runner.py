import sys
from PIL import Image
from rembg import remove, new_session

def smart_frame(img, mode='auto'):
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    bbox = img.getbbox()
    if not bbox:
        return img
    
    crop = img.crop(bbox)
    cw, ch = crop.size
    aspect = cw / ch
    
    # Check mode or auto-detect
    is_shoe = (mode == 'shoe') or (mode == 'auto' and aspect >= 1.15)
    
    if is_shoe:
        # Standardize to 1200x750 sneaker vault studio canvas with tight shoe framing
        target_w, target_h = 1200, 750
        max_w = int(target_w * 0.88)
        max_h = int(target_h * 0.78)
        scale = min(max_w / cw, max_h / ch)
        new_w, new_h = max(1, int(cw * scale)), max(1, int(ch * scale))
        resized = crop.resize((new_w, new_h), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        offset_x = (target_w - new_w) // 2
        offset_y = (target_h - new_h) // 2
        canvas.paste(resized, (offset_x, offset_y), resized)
        return canvas
    else:
        # Apparel for clothing rail: hook aligned tightly to top (y = 8px)
        pad_top = 8
        pad_bottom = 14
        pad_x = 12
        new_w = cw + pad_x * 2
        new_h = ch + pad_top + pad_bottom
        canvas = Image.new('RGBA', (new_w, new_h), (0, 0, 0, 0))
        canvas.paste(crop, (pad_x, pad_top), crop)
        return canvas

def main():
    if len(sys.argv) < 3:
        sys.exit(1)
        
    if sys.argv[1] == '--frame-only':
        in_path = sys.argv[2]
        out_path = sys.argv[3]
        mode = sys.argv[4] if len(sys.argv) > 4 else 'auto'
        inp = Image.open(in_path)
        framed = smart_frame(inp, mode=mode)
        framed.save(out_path, format='PNG')
        print('OK')
        return

    in_path = sys.argv[1]
    out_path = sys.argv[2]
    mode = sys.argv[3] if len(sys.argv) > 3 else 'auto'
    
    session = new_session('u2netp')
    inp = Image.open(in_path)
    if max(inp.size) > 1024:
        inp.thumbnail((1024, 1024))
    out = remove(inp, session=session)
    framed = smart_frame(out, mode=mode)
    framed.save(out_path, format='PNG')
    print('OK')

if __name__ == '__main__':
    main()
