export function buildAppUrl(request: Request, path: string) {
  const requestUrl = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    requestUrl.protocol.replace(":", "");

  if (!host) {
    return new URL(path, request.url);
  }

  return new URL(`${protocol}://${host}${path}`);
}
