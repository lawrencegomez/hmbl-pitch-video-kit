// Subject cut-out with Apple Vision (local, free): cutout <in> <out_rgba.png> <out_mask.png>
import Foundation
import Vision
import CoreImage
import AppKit
let a = CommandLine.arguments
let url = URL(fileURLWithPath: a[1])
let ci = CIImage(contentsOf: url)!
let req = VNGenerateForegroundInstanceMaskRequest()
let h = VNImageRequestHandler(ciImage: ci)
try h.perform([req])
guard let r = req.results?.first else { print("no subject"); exit(1) }
let buf = try r.generateMaskedImage(ofInstances: r.allInstances, from: h, croppedToInstancesExtent: false)
let mbuf = try r.generateScaledMaskForImage(forInstances: r.allInstances, from: h)
let ctx = CIContext()
func save(_ img: CIImage, _ path: String) {
  let cg = ctx.createCGImage(img, from: img.extent)!
  let rep = NSBitmapImageRep(cgImage: cg)
  try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: path))
}
save(CIImage(cvPixelBuffer: buf), a[2])
save(CIImage(cvPixelBuffer: mbuf), a[3])
print("ok", r.allInstances.count)
