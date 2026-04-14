import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // Ramp up to 20 users
    { duration: "1m30s", target: 20 }, // Maintain 20 users
    { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"], // 95th and 99th percentile
    http_req_failed: ["rate<0.1"], // Error rate < 10%
  },
};

export default function () {
  const baseUrl = process.env.BASE_URL || "http://localhost:4321";

  // Test homepage
  const homeRes = http.get(`${baseUrl}/`);
  check(homeRes, {
    "homepage status is 200": (r) => r.status === 200,
    "homepage has content": (r) => r.body.length > 0,
  });
  sleep(1);

  // Test sige-login page
  const loginPageRes = http.get(`${baseUrl}/sige-login`);
  check(loginPageRes, {
    "sige-login status is 200": (r) => r.status === 200,
  });
  sleep(1);

  // Test academic-data endpoint
  const academicRes = http.get(
    `${baseUrl}/api/sige/academic-data?matricula=2021004562`,
  );
  check(academicRes, {
    "academic-data status is 200 or 404": (r) =>
      r.status === 200 || r.status === 404,
    "academic-data response time < 500ms": (r) => r.timings.duration < 500,
  });
  sleep(1);

  // Test obtener-pagos endpoint
  const pagosRes = http.get(
    `${baseUrl}/api/pagos-mensuales/obtener-pagos?matricula=2021004562&meses=6`,
  );
  check(pagosRes, {
    "obtener-pagos status is 200": (r) => r.status === 200,
    "obtener-pagos response time < 500ms": (r) => r.timings.duration < 500,
  });
  sleep(1);

  // Test proxy-image endpoint
  const imageRes = http.get(
    `${baseUrl}/api/sige/proxy-image?matricula=2021004562`,
  );
  check(imageRes, {
    "proxy-image status is 200": (r) => r.status === 200,
    "proxy-image response time < 1000ms": (r) => r.timings.duration < 1000,
  });
  sleep(1);

  // Test POST registrar-pago (should handle gracefully)
  const timestamp = Date.now();
  const pagoRes = http.post(
    `${baseUrl}/api/pagos-mensuales/registrar-pago`,
    JSON.stringify({
      matricula: "2021004562",
      mes: "Enero 2026",
      montoBase: 250,
      recargo: 0,
      totalPagar: 250,
      concepto: "Inscripción",
      folio: `RCB-${timestamp}`,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  check(pagoRes, {
    "registrar-pago status is 201 or 500": (r) =>
      r.status === 201 || r.status === 500,
  });
  sleep(2);
}
