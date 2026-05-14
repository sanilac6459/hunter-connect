// handles all functionality related to clubs - creating, updating, deleting, and fetching clubs

const { PrismaClient } = require("@prisma/client");
const prisma = require("../prismaClient");
const supabase = require("../supabaseClient");

// helper function to upload image to Supabase Storage
const uploadImage = async (file) => {
  const fileName = `${Date.now()}_${file.originalname}`;
  const { error } = await supabase.storage
    .from("post-images")
    .upload(fileName, file.buffer, { contentType: file.mimetype });
  if (error) throw error;
  const { data } = supabase.storage.from("post-images").getPublicUrl(fileName);
  return data.publicUrl;
};

// get all groups (clubs)
const getAllGroups = async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: { memberships: true },
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// get single group (club) by id
const getGroupById = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: { memberships: true, posts: true },
    });
    if (!group) return res.status(404).json({ error: "Group not found." });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// creates a new group (club) and adds the creator as a member
const createGroup = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;
  // upload image
  try {
    let imageUrl = null;
    if (req.file) imageUrl = await uploadImage(req.file);

    const group = await prisma.group.create({
      data: { name, description, imageUrl },
    });

    await prisma.membership.create({
      data: { userId, groupId: group.id },
    });

    res.status(201).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// update a group (club) - only members can update
const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user.id;
  try {
    // check if user is a member of club
    const membership = await prisma.membership.findFirst({
      where: { groupId: parseInt(id), userId },
    });
    if (!membership)
      return res.status(403).json({ error: "Not a member of this group." });

    // upload new image
    let imageUrl = undefined;
    if (req.file) imageUrl = await uploadImage(req.file);

    const group = await prisma.group.update({
      where: { id: parseInt(id) },
      data: { name, description, ...(imageUrl && { imageUrl }) },
    });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// delete a group (club)
const deleteGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  // check if user is a member of club
  try {
    const membership = await prisma.membership.findFirst({
      where: { groupId: parseInt(id), userId },
    });
    if (!membership)
      return res.status(403).json({ error: "Not a member of this group." });

    // delete all posts add memberships related to this club in the db
    await prisma.post.deleteMany({ where: { groupId: parseInt(id) } });
    await prisma.membership.deleteMany({ where: { groupId: parseInt(id) } });
    await prisma.group.delete({ where: { id: parseInt(id) } }); // delete club

    res.json({ message: "Club deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};
