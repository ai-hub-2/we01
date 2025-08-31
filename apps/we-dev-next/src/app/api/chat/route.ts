export const runtime = "experimental-edge";
import { proxyToBolt } from "../_boltProxy";

export async function POST(request: Request) {
  return proxyToBolt(request);
}

export async function GET(request: Request) {
  return proxyToBolt(request);
}

