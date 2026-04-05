/**
 * Creates a Package.swift for capacitor-native-biometric so Capacitor 8 (SPM) can link it.
 * Also patches Plugin.swift to add CAPBridgedPlugin conformance, which is required by
 * Capacitor 8's SPM-based plugin discovery (replaces the old CAP_PLUGIN macro in Plugin.m).
 *
 * The published npm package only ships a .podspec (CocoaPods) — this shim adds SPM support.
 * Run automatically via the "postinstall" npm script.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginDir = path.join(__dirname, '..', 'node_modules', 'capacitor-native-biometric');

// ── 1. Inject Package.swift ────────────────────────────────────────────────────

const packageSwift = path.join(pluginDir, 'Package.swift');

const packageContent = `// swift-tools-version: 5.9
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

fs.writeFileSync(packageSwift, packageContent, 'utf8');
console.log('✓ Patched capacitor-native-biometric with Package.swift for SPM support');

// ── 2. Patch Plugin.swift: add CAPBridgedPlugin conformance ───────────────────
//
// Capacitor 8 discovers SPM plugins via the CAPBridgedPlugin protocol.
// The old CAP_PLUGIN macro (Plugin.m) is excluded from the SPM target and ignored.
// Without CAPBridgedPlugin, NativeBiometric.isAvailable() throws on device and the
// biometric lock option never appears in Settings.

const pluginSwift = path.join(pluginDir, 'ios', 'Plugin', 'Plugin.swift');
let source = fs.readFileSync(pluginSwift, 'utf8');

const oldDecl = '@objc(NativeBiometric)\npublic class NativeBiometric: CAPPlugin {';
const newDecl = `@objc(NativeBiometric)
public class NativeBiometric: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeBiometric"
    public let jsName = "NativeBiometric"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "verifyIdentity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCredentials", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setCredentials", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteCredentials", returnType: CAPPluginReturnPromise),
    ]`;

if (source.includes('CAPBridgedPlugin')) {
  console.log('✓ Plugin.swift already has CAPBridgedPlugin conformance — skipping patch');
} else if (!source.includes(oldDecl)) {
  console.warn('⚠ Could not find expected class declaration in Plugin.swift — skipping patch');
  console.warn('  Check that capacitor-native-biometric version is still 4.x');
} else {
  source = source.replace(oldDecl, newDecl);
  fs.writeFileSync(pluginSwift, source, 'utf8');
  console.log('✓ Patched Plugin.swift with CAPBridgedPlugin conformance for Capacitor 8');
}
