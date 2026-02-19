const { toFile } = require("@imagekit/nodejs");
const imagekit = require("../config/imagekit");

async function uploadToCloud(media) {
  try {
    const fileData = await imagekit.files.upload({
      file: await toFile(Buffer.from(media.buffer), media.originalname),
      fileName: media.originalname,
      folder: "/posts",
    });

    return fileData;
  } catch (error) {
    console.log(error);
  }
}

async function uploadToAvatar(avatar) {
  try {
    const fileData = await imagekit.files.upload({
      file: await toFile(Buffer.from(avatar.buffer), avatar.originalname),
      fileName: avatar.originalname,
      folder: "/avatars",
    });

    return fileData;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { uploadToCloud, uploadToAvatar };
