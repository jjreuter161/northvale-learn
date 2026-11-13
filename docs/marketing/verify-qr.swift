// Reads a QR code from an image with the Mac's own detector and prints what it says (or NONE).
//   swift docs/marketing/verify-qr.swift qr.png
import CoreImage
import Foundation

let path = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : ""
guard let image = CIImage(contentsOf: URL(fileURLWithPath: path)) else {
    print("NOIMAGE")
    exit(2)
}
let detector = CIDetector(ofType: CIDetectorTypeQRCode, context: nil, options: [CIDetectorAccuracy: CIDetectorAccuracyHigh])!
let found = detector.features(in: image).compactMap { ($0 as? CIQRCodeFeature)?.messageString }
print(found.first ?? "NONE")
