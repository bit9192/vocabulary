import fs from 'fs';
import { parse } from 'csv';
// const csvText = fs.readFileSync("data/lookup.csv", "utf-8");


const parser = parse();

const records = [];

fs.createReadStream("data/lookup.csv")
  .pipe(parser)
  .on("data", row => records.push(row))
  .on("end", () => {
    const obj = Object.fromEntries(records);
    console.log(obj);
    
    fs.writeFileSync("rootsLookup.json", JSON.stringify(obj, null, 2), "utf-8");
    
  });