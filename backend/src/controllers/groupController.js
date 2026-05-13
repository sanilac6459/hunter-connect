const prisma = require("../prismaClient");

// Get all groups
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

// Get a single group by id
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

// Create a group
const createGroup = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;
  try {
    const group = await prisma.group.create({
      data: { name, description },
    });

    // Automatically add creator as a member
    await prisma.membership.create({
      data: { userId, groupId: group.id },
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Update a group
const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user.id;
  try {
    // Check if user is a member
    const membership = await prisma.membership.findFirst({
      where: { groupId: parseInt(id), userId },
    });
    if (!membership)
      return res.status(403).json({ error: "Not a member of this group." });

    const group = await prisma.group.update({
      where: { id: parseInt(id) },
      data: { name, description },
    });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Delete a group
const deleteGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const membership = await prisma.membership.findFirst({
      where: { groupId: parseInt(id), userId },
    });
    if (!membership)
      return res.status(403).json({ error: "Not a member of this group." });

    // Delete related records first
    await prisma.post.deleteMany({ where: { groupId: parseInt(id) } });
    await prisma.membership.deleteMany({ where: { groupId: parseInt(id) } });

    await prisma.group.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Group deleted successfully." });
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
