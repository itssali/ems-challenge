import { redirect } from "react-router";
import { mkdir } from "fs/promises";
import { join } from "path";
import { getDB } from "~/db/getDB";
import { writeFile } from "fs/promises";

export async function action({ request, params }: { request: Request; params: { employeeId: string } }) {
  const formData = await request.formData();
  const type = formData.get("type") as string;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    throw new Error("No file uploaded");
  }

  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), "public", "uploads", params.employeeId);
  await mkdir(uploadsDir, { recursive: true });

  // Generate unique filename
  const ext = file.name.split(".").pop();
  const uniqueFilename = `${type}-${Date.now()}.${ext}`;
  const filePath = join(uploadsDir, uniqueFilename);

  // Write file to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // Generate public URL
  const publicPath = `/uploads/${params.employeeId}/${uniqueFilename}`;

  // Update database
  const db = await getDB();
  const field = type === "photo" ? "photo_path" : 
                type === "cv" ? "cv_path" : 
                "id_document_path";

  await db.run(
    `UPDATE employees SET ${field} = ? WHERE id = ?`,
    [publicPath, params.employeeId]
  );

  return redirect(`/employees/${params.employeeId}`);
} 