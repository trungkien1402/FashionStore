import sys
from PIL import Image

def smart_frame(img, mode='auto'):
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    if mode == 'lookbook':
        return img
    bbox = img.getbbox()
    if not bbox:
        return img
    
    crop = img.crop(bbox)
    cw, ch = crop.size
    aspect = cw / ch
    
    # Check mode or auto-detect
    is_shoe = mode in ('shoe', 'shoe-pair') or (mode == 'auto' and aspect >= 1.15)
    
    if is_shoe:
        # Match the separate single and pair frames used by Cyber Teal.
        target_w, target_h = (1200, 650) if mode == 'shoe-pair' else (1200, 750)
        max_w, max_h = (1120, 600) if mode == 'shoe-pair' else (979, 596)
        scale = min(max_w / cw, max_h / ch)
        new_w, new_h = max(1, int(cw * scale)), max(1, int(ch * scale))
        resized = crop.resize((new_w, new_h), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        offset_x = (target_w - new_w) // 2
        offset_y = (target_h - new_h) // 2
        canvas.paste(resized, (offset_x, offset_y))
        return canvas
    # Match the rail assets and align the hanger at the same height in every view.
    scale = min(554 / cw, 650 / ch)
    width, height = max(1, round(cw * scale)), max(1, round(ch * scale))
    resized = crop.resize((width, height), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (570, 688))
    canvas.paste(resized, ((570 - width) // 2, 14))
    return canvas

def main():
    if len(sys.argv) < 3:
        sys.exit(1)
        
    if sys.argv[1] == '--frame-only':
        in_path = sys.argv[2]
        out_path = sys.argv[3]
        mode = sys.argv[4] if len(sys.argv) > 4 else 'auto'
        with Image.open(in_path) as inp:
            framed = smart_frame(inp, mode=mode)
            output_format = inp.format
        if output_format == 'JPEG':
            background = Image.new('RGB', framed.size, 'white')
            background.paste(framed, mask=framed.getchannel('A'))
            framed = background
        framed.save(out_path, format=output_format)
        print('OK')
        return

    in_path = sys.argv[1]
    out_path = sys.argv[2]
    mode = sys.argv[3] if len(sys.argv) > 3 else 'auto'
    
    from rembg import remove, new_session

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
