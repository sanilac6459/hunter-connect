// handles user profile updates

const prisma = require("../prismaClient");
const supabase = require("../supabaseClient");

// update user profile picture
const updateProfilePicture = async (req, res) => {
  const userId = req.user.id;
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided." });

    const file = req.file;
    const fileName = `${Date.now()}_${file.originalname}`;

    // upload image to Supabase Storage
    const { error } = await supabase.storage
      .from("post-images")
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw error;

    // get public URL of the uploaded image
    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    // update user's profile picture URL in the database
    const user = await prisma.user.update({
      where: { id: userId },
      data: { imageUrl: data.publicUrl },
    });

    // return updated user info
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { updateProfilePicture };
