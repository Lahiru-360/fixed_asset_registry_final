import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
);

/**
 * Upload a file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Name for the file in storage
 * @param {string} bucketName - Bucket name (e.g., 'quotations', 'po-pdfs')
 * @param {string} contentType - MIME type (e.g., 'application/pdf', 'image/jpeg')
 * @param {boolean} overwrite - Whether to overwrite existing files (default: false)
 * @returns {Promise<string>} Public URL
 */
export async function uploadFileToStorage(
  fileBuffer,
  fileName,
  bucketName,
  contentType,
  overwrite = false
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: contentType,
        upsert: overwrite, // Allow overwriting if overwrite is true
      });

    if (error) {
      // If file exists and we're not overwriting, try to delete and re-upload
      if (error.statusCode === "409" && !overwrite) {
        // Try to delete existing file and re-upload
        await supabase.storage.from(bucketName).remove([fileName]);
        const { data: retryData, error: retryError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, fileBuffer, {
            contentType: contentType,
            upsert: false,
          });

        if (retryError) {
          console.error("Error uploading file to Supabase:", retryError);
          throw retryError;
        }

        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(retryData.path);

        return urlData.publicUrl;
      }

      console.error("Error uploading file to Supabase:", error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading file to Supabase Storage:", error);
    throw error;
  }
}

/**
 * Upload a PDF buffer to Supabase Storage
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} fileName - Name for the PDF file
 * @param {string} bucketName - Bucket name (e.g., 'po-pdfs', 'grn-pdfs')
 * @param {boolean} overwrite - Whether to overwrite existing files (default: true for PDFs)
 * @returns {Promise<string>} Public URL
 */
export async function uploadPDFToStorage(
  pdfBuffer,
  fileName,
  bucketName,
  overwrite = true
) {
  return uploadFileToStorage(
    pdfBuffer,
    fileName,
    bucketName,
    "application/pdf",
    overwrite // PDFs can be regenerated, so allow overwriting by default
  );
}

/**
 * Delete a file from Supabase Storage
 * @param {string} fileName - File name/path
 * @param {string} bucketName - Bucket name
 * @returns {Promise<void>}
 */
export async function deleteFileFromStorage(fileName, bucketName) {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error("Error deleting file from Supabase Storage:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * Get a signed URL for private file access (valid for 1 hour)
 * @param {string} fileName - File name/path
 * @param {string} bucketName - Bucket name
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} Signed URL
 */
export async function getSignedUrl(fileName, bucketName, expiresIn = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, expiresIn);

    if (error) {
      console.error("Error generating signed URL:", error);
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
}

/**
 * Download a file from Supabase Storage as buffer
 * @param {string} fileName - File name/path
 * @param {string} bucketName - Bucket name
 * @returns {Promise<Buffer>} File buffer
 */
export async function downloadFileAsBuffer(fileName, bucketName) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) {
      console.error("Error downloading file from Supabase:", error);
      throw error;
    }

    // Convert blob to buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

export { supabase };
