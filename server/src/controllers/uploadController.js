import { randomUUID } from "crypto";
import path from "path";
import { supabaseAdmin } from "../config/supabase.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest } from "../utils/AppError.js";
import { DOC_TYPES } from "../schemas/index.js";

const LEDGER_TYPES = new Set(["ledger", "proof_of_business"]);

/**
 * POST /uploads  (multipart/form-data)
 * Fields: file (binary), doc_type (string)
 *
 * The backend acts as a secure proxy: it validates the file, stores it in the
 * correct private Supabase Storage bucket under `<userId>/...`, and records
 * metadata in kyc_documents linked to the user profile.
 */
export const uploadDocument = asyncHandler(async (req, res) => {
  const { file } = req;
  const docType = req.body.doc_type;

  if (!file) throw badRequest("No file provided (field name must be 'file')");
  if (!DOC_TYPES.includes(docType)) {
    throw badRequest(`Invalid doc_type. Allowed: ${DOC_TYPES.join(", ")}`);
  }

  const bucket = LEDGER_TYPES.has(docType) ? env.ledgerBucket : env.kycBucket;
  const ext = path.extname(file.originalname) || ".jpg";
  const storagePath = `${req.user.id}/${docType}-${randomUUID()}${ext}`;

  const { error: upErr } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (upErr) throw badRequest(`Upload failed: ${upErr.message}`);

  const { data: doc, error: dbErr } = await supabaseAdmin
    .from("kyc_documents")
    .insert({
      user_id: req.user.id,
      doc_type: docType,
      bucket,
      storage_path: storagePath,
      file_name: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
    })
    .select("id, doc_type, file_name, created_at")
    .single();

  if (dbErr) {
    // Roll back the orphaned storage object if the metadata insert failed.
    await supabaseAdmin.storage.from(bucket).remove([storagePath]);
    throw badRequest(`Could not save document metadata: ${dbErr.message}`);
  }

  res.status(201).json({ document: doc });
});

/**
 * GET /uploads/:id/url — returns a short-lived signed URL for a document the
 * user owns (or any doc, for admins). Files are never public.
 */
export const getSignedUrl = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: doc, error } = await supabaseAdmin
    .from("kyc_documents")
    .select("user_id, bucket, storage_path, doc_type, file_name")
    .eq("id", id)
    .single();

  if (error || !doc) throw badRequest("Document not found");

  const isAdmin = ["admin", "super_admin"].includes(req.role);
  if (!isAdmin && doc.user_id !== req.user.id) {
    throw badRequest("You do not have access to this document");
  }

  const { data: signed, error: sErr } = await supabaseAdmin.storage
    .from(doc.bucket)
    .createSignedUrl(doc.storage_path, 60 * 10); // 10 minutes

  if (sErr) throw badRequest(`Could not create signed URL: ${sErr.message}`);

  res.json({
    url: signed.signedUrl,
    doc_type: doc.doc_type,
    file_name: doc.file_name,
    expires_in: 600,
  });
});
