import { describe, it, expect } from "vitest";
import { getRelativeDeadline, formatDate, cn } from "./utils";

describe("Utils tests", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2 py-1", "bg-blue-500", { "text-white": true })).toBe("px-2 py-1 bg-blue-500 text-white");
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("formats date strings and objects", () => {
    const d = new Date("2026-10-15T00:00:00Z");
    expect(formatDate(d)).toContain("2026");
    expect(formatDate(null)).toBe("");
  });

  it("calculates relative deadlines correctly", () => {
    const now = new Date();

    // 2 days in the future
    const future = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const futureResult = getRelativeDeadline(future);
    expect(futureResult.isOverdue).toBe(false);
    expect(futureResult.isDueSoon).toBe(true);

    // 5 days in the future
    const later = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const laterResult = getRelativeDeadline(later);
    expect(laterResult.isOverdue).toBe(false);
    expect(laterResult.isDueSoon).toBe(false);

    // 2 days in the past
    const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const pastResult = getRelativeDeadline(past);
    expect(pastResult.isOverdue).toBe(true);
    expect(pastResult.text).toContain("Overdue");

    // Flexible / No Deadline
    const flexibleResult = getRelativeDeadline(past, { isNoDeadline: true });
    expect(flexibleResult.isOverdue).toBe(false);
    expect(flexibleResult.text).toBe("Fleksibel (Tanpa Tenggat)");
  });

  it("identifies tasks with flexible or no deadline correctly", async () => {
    const { isTaskFlexibleOrNoDeadline } = await import("./utils");
    expect(isTaskFlexibleOrNoDeadline({ title: "Tugas [Tanpa Deadline] Praktek" })).toBe(true);
    expect(isTaskFlexibleOrNoDeadline({ notes: "Tugas mandiri tanpa tenggat waktu" })).toBe(true);
    expect(isTaskFlexibleOrNoDeadline({ notes: "Tugas fleksibel" })).toBe(true);
    expect(isTaskFlexibleOrNoDeadline({ title: "Tugas Biasa", notes: "Kumpul di LMS" })).toBe(false);
  });

  it("normalizes external URLs and prevents relative navigation bugs", async () => {
    const {
      formatExternalUrl,
      formatInstagramUrl,
      formatGithubUrl,
      formatLinkedinUrl,
    } = await import("./utils");

    // Portfolio URL checks (specifically the user's issue: desakpradnyani.vercel.app)
    expect(formatExternalUrl("desakpradnyani.vercel.app")).toBe("https://desakpradnyani.vercel.app");
    expect(formatExternalUrl("https://desakpradnyani.vercel.app")).toBe("https://desakpradnyani.vercel.app");
    expect(formatExternalUrl("http://desakpradnyani.vercel.app")).toBe("http://desakpradnyani.vercel.app");
    expect(formatExternalUrl("/desakpradnyani.vercel.app")).toBe("https://desakpradnyani.vercel.app");
    expect(formatExternalUrl("")).toBe("");
    expect(formatExternalUrl(null)).toBe("");
    expect(formatExternalUrl(undefined)).toBe("");

    // Instagram URL checks
    expect(formatInstagramUrl("desakpradnyani")).toBe("https://instagram.com/desakpradnyani");
    expect(formatInstagramUrl("@desakpradnyani")).toBe("https://instagram.com/desakpradnyani");
    expect(formatInstagramUrl("https://instagram.com/desakpradnyani")).toBe("https://instagram.com/desakpradnyani");
    expect(formatInstagramUrl("")).toBe("");

    // GitHub URL checks
    expect(formatGithubUrl("desakpradnyani")).toBe("https://github.com/desakpradnyani");
    expect(formatGithubUrl("@desakpradnyani")).toBe("https://github.com/desakpradnyani");
    expect(formatGithubUrl("https://github.com/desakpradnyani")).toBe("https://github.com/desakpradnyani");

    // LinkedIn URL checks
    expect(formatLinkedinUrl("desakpradnyani")).toBe("https://linkedin.com/in/desakpradnyani");
    expect(formatLinkedinUrl("@desakpradnyani")).toBe("https://linkedin.com/in/desakpradnyani");
    expect(formatLinkedinUrl("https://linkedin.com/in/desakpradnyani")).toBe("https://linkedin.com/in/desakpradnyani");
  });

  it("normalizes Google Drive photo URLs to direct image CDN endpoints", async () => {
    const {
      extractGoogleDriveFileId,
      isGoogleDriveUrl,
      formatPhotoUrl,
    } = await import("./utils");

    const testId = "1qgIzTm5-9i8AJhGfZEs83SPXlTkN0diw";
    const expectedCdn = `https://lh3.googleusercontent.com/d/${testId}`;

    // 1. Google Drive /open?id= format (actual production database format)
    expect(extractGoogleDriveFileId(`https://drive.google.com/open?id=${testId}`)).toBe(testId);
    expect(isGoogleDriveUrl(`https://drive.google.com/open?id=${testId}`)).toBe(true);
    expect(formatPhotoUrl(`https://drive.google.com/open?id=${testId}`)).toBe(expectedCdn);

    // 2. Google Drive /file/d/.../view with query params (sharing link format)
    expect(extractGoogleDriveFileId(`https://drive.google.com/file/d/${testId}/view?usp=sharing`)).toBe(testId);
    expect(formatPhotoUrl(`https://drive.google.com/file/d/${testId}/view?usp=sharing`)).toBe(expectedCdn);

    // 3. Google Drive /file/d/... without view
    expect(extractGoogleDriveFileId(`https://drive.google.com/file/d/${testId}`)).toBe(testId);
    expect(formatPhotoUrl(`https://drive.google.com/file/d/${testId}`)).toBe(expectedCdn);

    // 4. Google Drive /uc?id= export format
    expect(extractGoogleDriveFileId(`https://drive.google.com/uc?export=view&id=${testId}`)).toBe(testId);
    expect(formatPhotoUrl(`https://drive.google.com/uc?export=view&id=${testId}`)).toBe(expectedCdn);

    // 5. Google Drive /thumbnail?id=
    expect(extractGoogleDriveFileId(`https://drive.google.com/thumbnail?id=${testId}&sz=w800`)).toBe(testId);
    expect(formatPhotoUrl(`https://drive.google.com/thumbnail?id=${testId}&sz=w800`)).toBe(expectedCdn);

    // 6. Docs.google.com/file/d/...
    expect(extractGoogleDriveFileId(`https://docs.google.com/file/d/${testId}/edit`)).toBe(testId);
    expect(formatPhotoUrl(`https://docs.google.com/file/d/${testId}/edit`)).toBe(expectedCdn);

    // 7. Already lh3.googleusercontent.com/d/... format
    expect(extractGoogleDriveFileId(`https://lh3.googleusercontent.com/d/${testId}`)).toBe(testId);
    expect(formatPhotoUrl(`https://lh3.googleusercontent.com/d/${testId}`)).toBe(expectedCdn);

    // 8. Non-Google external URLs MUST remain completely unchanged
    const unsplashUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500";
    expect(extractGoogleDriveFileId(unsplashUrl)).toBeNull();
    expect(isGoogleDriveUrl(unsplashUrl)).toBe(false);
    expect(formatPhotoUrl(unsplashUrl)).toBe(unsplashUrl);

    // 9. Base64 data URLs MUST remain unchanged
    const dataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD";
    expect(extractGoogleDriveFileId(dataUrl)).toBeNull();
    expect(formatPhotoUrl(dataUrl)).toBe(dataUrl);

    // 10. Local relative paths MUST remain unchanged
    const localPath = "/images/students/budi.jpg";
    expect(extractGoogleDriveFileId(localPath)).toBeNull();
    expect(formatPhotoUrl(localPath)).toBe(localPath);

    // 11. Empty / null values
    expect(formatPhotoUrl("")).toBe("");
    expect(formatPhotoUrl(null)).toBe("");
    expect(formatPhotoUrl(undefined)).toBe("");

    // 12. getGoogleDriveViewUrl canonical viewer URL
    const { getGoogleDriveViewUrl } = await import("./utils");
    const azkaId = "1bJMFppsgAxnAoKCzgYHakaEtVmED54FY";
    const azkaExpectedView = `https://drive.google.com/file/d/${azkaId}/view`;
    expect(getGoogleDriveViewUrl(`https://drive.google.com/open?id=${azkaId}`)).toBe(azkaExpectedView);
    expect(getGoogleDriveViewUrl(`https://drive.google.com/file/d/${azkaId}/view`)).toBe(azkaExpectedView);
    expect(getGoogleDriveViewUrl(`https://lh3.googleusercontent.com/d/${azkaId}`)).toBe(azkaExpectedView);
    expect(getGoogleDriveViewUrl(unsplashUrl)).toBe(unsplashUrl);
  });
});
