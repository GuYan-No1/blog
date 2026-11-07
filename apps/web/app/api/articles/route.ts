export async function GET() {
  const baseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${baseUrl}/articles`, {
    cache: "no-store",
  });
  const data = await response.json();

  return Response.json(data, {
    status: response.status,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const baseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${baseUrl}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return Response.json(data, {
    status: response.status,
  });
}
