import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	outputFileTracingIncludes: {
		"/*": ["./knowledge/recommendations/**/*.md"],
	},
};

export default nextConfig;
