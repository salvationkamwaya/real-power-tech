export function json(data, init = 200) {
  const status = typeof init === "number" ? init : init?.status ?? 200;
  return Response.json(data, {
    status,
    ...(typeof init === "object" ? init : {}),
  });
}

export function badRequest(message) {
  return json({ status: 400, error: "Bad Request", message }, 400);
}
export function unauthorized(message = "Unauthorized") {
  return json({ status: 401, error: "Unauthorized", message }, 401);
}
export function notFound(message = "Not Found") {
  return json({ status: 404, error: "Not Found", message }, 404);
}
export function conflict(message) {
  return json({ status: 409, error: "Conflict", message }, 409);
}
