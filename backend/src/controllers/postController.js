const { PrismaClient } = require("@prisma/client");
const prisma = require("../prismaClient");
const supabase = require("../supabaseClient");

// Get all posts in a group
const getPostsByGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
    const membership = await prisma.membership.findFirst({
      where: { groupId: parseInt(groupId), userId },
    });
    if (!membership)
      return res.status(403).json({ error: "Not a member of this group." });

    const posts = await prisma.post.findMany({
      where: { groupId: parseInt(groupId) },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Create a post
const createPost = async (req, res) => {
  const { groupId } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const membership = await prisma.membership.findFirst({
      where: { groupId: parseInt(groupId), userId },
    });
    if (!membership)
      return res.status(403).json({ error: "Not a member of this group." });

    let imageUrl = null;

    // Handle image upload if file is provided
    if (req.file) {
      const file = req.file;
      const fileName = `${Date.now()}_${file.originalname}`;

      const { error } = await supabase.storage
        .from("post-images")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const post = await prisma.post.create({
      data: { title, content, imageUrl, userId, groupId: parseInt(groupId) },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Update a post
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });
    if (!post) return res.status(404).json({ error: "Post not found." });
    if (post.userId !== userId)
      return res.status(403).json({ error: "Not authorized." });

    let imageUrl = post.imageUrl;

    // Handle image upload if file is provided
    if (req.file) {
      const file = req.file;
      const fileName = `${Date.now()}_${file.originalname}`;

      const { error } = await supabase.storage
        .from("post-images")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { title, content, imageUrl },
    });
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });
    if (!post) return res.status(404).json({ error: "Post not found." });
    if (post.userId !== userId)
      return res.status(403).json({ error: "Not authorized." });

    await prisma.post.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Post deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { getPostsByGroup, createPost, updatePost, deletePost };
