async function main() {
  const res = await fetch("http://localhost:3000/api/transport/arrivals?date=2026-10-17");
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Count on 2026-10-17:", data.arrivals?.length);
  if (data.arrivals?.length > 0) {
    for (const a of data.arrivals) {
      console.log(`- [${a.scheduledTime}] ${a.universityName} @ ${a.venue}`);
    }
  }

  const res16 = await fetch("http://localhost:3000/api/transport/arrivals?date=2026-10-16");
  const data16 = await res16.json();
  console.log("\nCount on 2026-10-16:", data16.arrivals?.length);
  if (data16.arrivals?.length > 0) {
    for (const a of data16.arrivals) {
      console.log(`- [${a.scheduledTime}] ${a.universityName} @ ${a.venue}`);
    }
  }
}

main().catch(console.error);
