import fs from "fs";
import path from "path";
import { MASTER_INSTITUTIONS } from "../src/data/institutions";

const targetPath = path.resolve(__dirname, "../docs/csv-examples/institutions/university_master_template.csv");

const lines = ["institution_code,university_name,state,city,district,status"];

for (const inst of MASTER_INSTITUTIONS) {
  const safeName = inst.name.includes(",") ? `"${inst.name}"` : inst.name;
  const safeState = inst.state.includes(",") ? `"${inst.state}"` : inst.state;
  const safeCity = inst.city ? (inst.city.includes(",") ? `"${inst.city}"` : inst.city) : "";
  const safeDistrict = inst.district ? (inst.district.includes(",") ? `"${inst.district}"` : inst.district) : "";
  lines.push(`${inst.institutionCode},${safeName},${safeState},${safeCity},${safeDistrict},${inst.status}`);
}

fs.writeFileSync(targetPath, lines.join("\n") + "\n", "utf-8");
console.log(`Updated ${targetPath} with ${MASTER_INSTITUTIONS.length} records.`);
