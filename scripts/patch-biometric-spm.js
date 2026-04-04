/**
 * Creates a Package.swift for capacitor-native-biometric so Capacitor 8 (SPM) can link it.
 * The published npm package only ships a .podspec (CocoaPods) — this shim adds SPM support.
 * Run automatically via the "postinstall" npm script.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dest = path.join(__dirname, '..', 'node_modules', 'capacitor-native-biometric', 'Package.swift');

const content = `// swift-tools-version: 5.9
import PackageDescription

// Hand-crafted SPM manifest for capacitor-native-biometric v4
let package = Package(
    name: "CapacitorNativeBiometric",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "CapacitorNativeBiometric",
            targets: ["CapacitorNativeBiometric"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "CapacitorNativeBiometric",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Plugin",
            exclude: ["Plugin.m", "Plugin.h", "Info.plist"],
            sources: ["Plugin.swift"]
        )
    ]
)
`;

fs.writeFileSync(dest, content, 'utf8');
console.log('✓ Patched capacitor-native-biometric with Package.swift for SPM support');
