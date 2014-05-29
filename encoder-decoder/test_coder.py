#!/usr/bin/python

import unittest
import coder
import decoder
from PIL import Image
import json
from config_reader import LayerConfig

class TestCoder(unittest.TestCase):

    def encode(self, filename, configname):
        img = Image.open(filename)
        basename=filename.split("/")[1]
        config = json.load(open(configname, "rb"))
        layers = coder.Coder().encode(img, config)
        i = 0
        layers2 = []
        for layer in layers:
            i += 1
            layerFileName = "/Users/sdragos/responsive-image-format/encoder-decoder/samples/test_results/" + basename + "_layer" + str(i) + ".webp"
            layer[0].save(layerFileName, "WEBP", quality=95)
            #layer[0].save(layerFileName+".png", "PNG", quality=95)
            # TODO: Run ssim test to see that the image we got is correct
            layer2 = Image.open(layerFileName)
            layers2.append(layer2)
        #print layers2
        #the_decoder = decoder.Decoder()
        #dcd = decoder.Decoder().decode(layers2)
        #dcd.save("/Users/sdragos/responsive-image-format/encoder-decoder/samples/test_results/decoded.png", "PNG")
        #img.save("/Users/sdragos/responsive-image-format/encoder-decoder/samples/test_results/crop.png", "PNG")
    """
    def testEncodeCrop(self):
        # Currently this test passes anyway, but it creates a bunch of file that enable to peek into the outputs
        # Improvements: ssim test, output layers file size and final output file size
        self.encode("samples/bears-fishing.jpg", "samples/bears-fishing-crop-config.txt")
    """
    def testEncodeResSwitch(self):
        # Currently this test passes anyway, but it creates a bunch of file that enable to peek into the outputs
        # Improvements: ssim test, output layers file size and final output file size
        self.encode("samples/res_switch.png", "samples/res_switch_config.txt")

def main():
    unittest.main()

if __name__ == '__main__':
    main()
