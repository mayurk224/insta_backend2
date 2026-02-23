async function deleteImageKitFiles(fileIds) {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    const error = new Error("ImageKit private key not configured");
    error.status = 500;
    throw error;
  }

  if (typeof fetch !== "function") {
    const error = new Error("fetch is not available in this environment");
    error.status = 500;
    throw error;
  }

  const authHeader = Buffer.from(`${privateKey}:`).toString("base64");

  for (const fileId of fileIds) {
    if (!fileId) {
      continue;
    }

    let response;

    try {
      response = await fetch(
        `https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Basic ${authHeader}`,
          },
        },
      );
    } catch (error) {
      const err = new Error("Failed to delete media file from ImageKit");
      err.status = 500;
      throw err;
    }

    if (!response.ok && response.status !== 404) {
      const err = new Error("Failed to delete media file from ImageKit");
      err.status = 500;
      throw err;
    }
  }
}

module.exports = deleteImageKitFiles;
