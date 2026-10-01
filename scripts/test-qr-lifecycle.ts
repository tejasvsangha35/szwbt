import { prisma } from "../src/lib/prisma";
import { getUserContext } from "../src/lib/rbac/service";
import { createSessionToken } from "../src/lib/rbac/token";

async function lifecycleTest() {
  const user = await prisma.user.findFirst({ where: { email: "admin@szwbt2026.edu" } });
  if (!user) throw new Error("Admin user not found");
  const ctx = (await getUserContext(user.id))!;
  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    roles: ctx.roles,
    permissions: ctx.permissions,
  });
  const headers = { Cookie: "szwbt_session=" + token, "Content-Type": "application/json" };

  console.log("--- Step 1: Initial state check ---");
  let res = await fetch("http://localhost:3000/api/participants", { headers });
  let data = await res.json();
  const target = data.participants.find((p: any) => p.id === "p1-ananya-sharma");
  console.log("Target before upload:", {
    name: target.name,
    status: target.status,
    documentsStatus: target.documentsStatus,
    qrToken: target.qrToken,
    docsCount: target.documents.length,
  });

  if (target.qrToken !== null) {
    throw new Error("FAIL: qrToken must be null before documents and verification!");
  }

  console.log("\n--- Step 2: Upload document with autoVerify=false ---");
  const uploadRes = await fetch("http://localhost:3000/api/documents/upload", {
    method: "POST",
    headers,
    body: JSON.stringify({
      participantId: target.id,
      type: "AADHAAR",
      fileName: "ananya_aadhaar.pdf",
      fileSize: 2048,
      mimeType: "application/pdf",
      autoVerify: false,
    }),
  });
  const uploadData = await uploadRes.json();
  console.log("Upload result:", {
    success: uploadData.success,
    docStatus: uploadData.document?.status,
    qrGenerated: uploadData.qrGenerated,
    qrToken: uploadData.qrToken,
  });

  if (uploadData.qrGenerated !== false || uploadData.qrToken !== null) {
    throw new Error("FAIL: Document upload without verification should NOT generate QR!");
  }

  console.log("\n--- Step 3: Check participant state after upload (should be unverified, QR null) ---");
  res = await fetch("http://localhost:3000/api/participants", { headers });
  data = await res.json();
  const afterUpload = data.participants.find((p: any) => p.id === "p1-ananya-sharma");
  console.log("Target after upload:", {
    documentsStatus: afterUpload.documentsStatus,
    qrToken: afterUpload.qrToken,
    docsCount: afterUpload.documents.length,
  });

  if (afterUpload.documentsStatus !== "PENDING" || afterUpload.qrToken !== null) {
    throw new Error("FAIL: Participant must show PENDING and qrToken=null while document is unverified!");
  }

  console.log("\n--- Step 4: Verify document via verification endpoint ---");
  const verifyRes = await fetch("http://localhost:3000/api/registration/documents/verify", {
    method: "POST",
    headers,
    body: JSON.stringify({
      documentId: uploadData.document.id,
      participantId: target.id,
      status: "VERIFIED",
      markAll: true,
    }),
  });
  const verifyData = await verifyRes.json();
  console.log("Verify result:", {
    success: verifyData.success,
    allVerified: verifyData.allVerified,
    qrGenerated: verifyData.qrGenerated,
    qrToken: verifyData.qrToken?.slice(0, 20) + "...",
  });

  if (!verifyData.allVerified || !verifyData.qrGenerated || !verifyData.qrToken) {
    throw new Error("FAIL: Successful verification must generate QR pass!");
  }

  console.log("\n--- Step 5: Check participant state after successful verification (VERIFIED with active QR) ---");
  res = await fetch("http://localhost:3000/api/participants", { headers });
  data = await res.json();
  const afterVerify = data.participants.find((p: any) => p.id === "p1-ananya-sharma");
  console.log("Target after verification:", {
    status: afterVerify.status,
    documentsStatus: afterVerify.documentsStatus,
    qrToken: afterVerify.qrToken?.slice(0, 20) + "...",
    docsCount: afterVerify.documents.length,
  });

  if (afterVerify.documentsStatus !== "VERIFIED" || !afterVerify.qrToken) {
    throw new Error("FAIL: Participant must show VERIFIED and have active qrToken after successful verification!");
  }

  console.log("\n--- Step 6: Cleanup test record to preserve baseline ---");
  await prisma.qrPass.deleteMany({ where: { participantId: target.id } });
  await prisma.document.deleteMany({ where: { id: uploadData.document.id } });
  await prisma.participant.update({
    where: { id: target.id },
    data: { status: "PENDING", qrCode: null },
  });
  console.log("All lifecycle checks PASSED! Cleanup completed successfully.");
}

lifecycleTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
