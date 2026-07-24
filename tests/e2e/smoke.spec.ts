import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/dashboard",
  "/dashboard/upload",
  "/dashboard/events",
  "/dashboard/map",
  "/dashboard/reports",
  "/dashboard/settings",
  "/pilot-proposal",
];

test("core routes render without horizontal overflow", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${route} overflows horizontally`).toBeLessThanOrEqual(1);
  }
});

test("synthetic processing API completes with reviewable detections", async ({ request }) => {
  const response = await request.post("/api/processing/jobs", {
    data: {
      sourceType: "synthetic_demo",
      demoId: "synthetic-barasat-junction",
      videoName: "Synthetic traffic safety demo",
      requestedMode: "mock",
    },
  });

  expect(response.status()).toBe(201);
  const payload = await response.json();
  expect(payload.job.status).toBe("completed");
  expect(payload.detections.length).toBeGreaterThan(0);
  expect(payload.detections.every((item: { humanReviewStatus: string }) => item.humanReviewStatus === "pending"))
    .toBeTruthy();
});

test("unsafe processing and footage requests fail closed", async ({ request }) => {
  const invalidJob = await request.post("/api/processing/jobs", {
    data: { sourceType: "synthetic_demo", requestedMode: "mock" },
  });
  expect(invalidJob.status()).toBe(400);

  const directMutation = await request.patch("/api/processing/jobs/nonexistent", {
    data: { status: "completed", progress: 100 },
  });
  expect(directMutation.status()).toBe(403);

  const missingAuthorizationReference = await request.post("/api/authorized-footage/intakes", {
    data: {
      title: "Safety test intake",
      sourceType: "municipal_uploaded_clip",
      locationLabel: "Synthetic test location",
      jurisdiction: "Test jurisdiction",
      authorizationContact: "Test nodal contact",
      status: "authorized",
      privacyMaskingRequired: true,
      faceBlurRequired: true,
      plateMaskingRequired: true,
      humanReviewRequired: true,
    },
  });
  expect(missingAuthorizationReference.status()).toBe(400);
});

test("prototype safety language remains visible", async ({ page }) => {
  await page.goto("/dashboard/upload");
  const safetyAlert = page.getByRole("alert").filter({ hasText: "Prototype safeguards" });
  await expect(safetyAlert).toBeVisible();
  await expect(safetyAlert).toContainText("Authorized uploaded clips only");
  await expect(safetyAlert).toContainText("No facial recognition");
  await expect(safetyAlert).toContainText("pending human review");
});
