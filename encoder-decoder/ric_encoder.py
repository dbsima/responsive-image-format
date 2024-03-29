#!/usr/bin/python

import iso_media
from PIL import Image
from StringIO import StringIO
import sys
from coder import Coder
from decoder import Decoder
import wrapper
import json

def ric_encode(imgbuf, config):
    img = Image.open(StringIO(imgbuf))
    layers = Coder().encode(img, config)
    wrapped_layers, offsetTable = wrapper.wrapLayers(layers)
    output = ""
    output += iso_media.write_box("FTYP", "RIC ")
    output += iso_media.write_box("ILOT", write_layer_offsets(offsetTable))
    output += wrapped_layers
    return output

def ric_decode(imgbuf):
    offset = 0
    boxType = None
    boxLen, boxType, payload = iso_media.read_box(imgbuf[offset:])
    if boxType != "FTYP" or payload != "RIC ":
        print >> sys.stderr, "Fishy file type!!!", boxType, payload
        return None
    offset += boxLen
    boxLen, boxType, payload = iso_media.read_box(imgbuf[offset:])
    if boxType != "ILOT":
        print >> sys.stderr, "No offset table???", boxType
        return None
    offset += boxLen
    layers = wrapper.unwrapLayers(imgbuf[offset:])
    print layers
    outputImg = Decoder().decode(layers)
    output = StringIO()
    outputImg.save(output, "JPEG", quality = 90);
    return output.getvalue()


def write_layer_offsets(offsetTable):
    buf = ""
    for offset, res in offsetTable:
        width, height = res
        buf += iso_media.write_int16(width)
        buf += iso_media.write_int16(height)
        buf += iso_media.write_int32(offset)
    return buf

commands = {
        "decode": ric_decode,
        "encode": ric_encode,
        }

def read_cli_args():
    if len(sys.argv) < 2:
        print >>sys.stderr, "Usage:", sys.argv[0], "encode/decode <input file> <output file> <config file>"
        return None
    commandStr = sys.argv[1]
    if not commands.has_key(commandStr):
        print >> sys.stderr, "Command can be only one of", commands.keys()
        return None
    command = commands[commandStr]
    config_filename = ""
    if commandStr == "encode":
        if len(sys.argv) < 4:
            print >>sys.stderr, "Usage:", sys.argv[0], "encode/decode <input file> <output file> <config file>"
            return None
        config_filename = sys.argv[4]
    else:
        if len(sys.argv) < 3:
            print >>sys.stderr, "Usage:", sys.argv[0], "encode/decode <input file> <output file>"
            return None
    input_filename = sys.argv[2]
    output_filename = sys.argv[3]
    return command, input_filename, output_filename, config_filename

def apply(command, input_filename, output_filename, config_filename):
    input = open(input_filename, "rb").read()
    if config_filename:
        config = json.load(open(config_filename, "rb"))
        output = command(input, config)
    else:
        output = command(input)
    if output:
        open(output_filename, "wb").write(output)

def main():
    args = read_cli_args()
    if args:
        apply(*args)

if __name__ == "__main__":
    main()


