// handles user profile updates and account deletion

const prisma = require("../prismaClient");
const supabase = require("../supabaseClient");

// update profile picture
const updateProfilePicture = async (req, res) => {
  const userId = req.user.id;
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided." });

    const file = req.file;
    const fileName = `${Date.now()}_${file.originalname}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw error;

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { imageUrl: data.publicUrl },
    });

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

// remove profile picture
const removeProfilePicture = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { imageUrl: null },
    });

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

// update user profile (name + email)
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;
  try {
    // check if email is already taken by another user
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        return res.status(400).json({ error: "Email already in use." });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

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

// delete user account
const deleteAccount = async (req, res) => {
  const userId = req.user.id;
  try {
    await prisma.post.deleteMany({ where: { userId } });
    await prisma.membership.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = {
  updateProfilePicture,
  removeProfilePicture,
  updateProfile,
  deleteAccount,
};
