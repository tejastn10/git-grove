import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	compress: true,
	// Allow the dev server to be reached from other devices on the LAN (phone, tablet,
	// another laptop). Wildcards cover the private IP ranges so it keeps working when
	// DHCP hands this machine a different address. `*.local` covers the mDNS hostname.
	allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
};

export default nextConfig;
