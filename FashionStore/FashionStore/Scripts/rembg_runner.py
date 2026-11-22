import sys
from PIL import Image
from rembg import remove, new_session

def main():
    if len(sys.argv) < 3:
        sys.exit(1)
    in_path = sys.argv[1]
    out_path = sys.argv[2]
    session = new_session('u2netp')
    inp = Image.open(in_path)
    if max(inp.size) > 1024:
        inp.thumbnail((1024, 1024))
    out = remove(inp, session=session)
    out.save(out_path, format='PNG')
    print('OK')

if __name__ == '__main__':
    main()
