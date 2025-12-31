import dayjs from "dayjs";
import Counter from "@/model/counter-model";

export async function generateCertificateNumber(prefix = "LL") {
  // Atomically increment counter for this prefix
  const counter = await Counter.findOneAndUpdate(
    { prefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // create if missing
  );

  const numberPart = String(counter.seq).padStart(5, "0");
  const datePart = dayjs().format("DDMMYY");

  return `${prefix}${datePart}${numberPart}`;
}
