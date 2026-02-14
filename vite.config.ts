import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const normalizeBasePath = (value: string | undefined) => {
  if (!value || value.trim() === "") {
    return "/";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
};

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: normalizeBasePath(process.env.VITE_BASE_PATH),
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
