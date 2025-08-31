export const runtime = "experimental-edge";
import { proxyToBolt } from "../_boltProxy";

export async function GET(request: Request) {
  return proxyToBolt(request);
}

export async function POST(request: Request) {
  return proxyToBolt(request);
}

export async function PUT(request: Request) {
  return proxyToBolt(request);
}

export async function DELETE(request: Request) {
  return proxyToBolt(request);
}

export async function PATCH(request: Request) {
  return proxyToBolt(request);
}

export async function OPTIONS(request: Request) {
  return proxyToBolt(request);
}

