const prisma = require("../prismaClient");

// Join a group
const joinGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
    // Check if already a member
    const existingMembership = await prisma.membership.findFirst({
      where: { groupId: parseInt(groupId), userId },
    });
    if (existingMembership)
      return res.status(400).json({ error: "Already a member of this group." });

    const membership = await prisma.membership.create({
      data: { userId, groupId: parseInt(groupId) },
    });
    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Leave a group
const leaveGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
    // Check if a member
    const membership = await prisma.membership.findFirst({
      where: { groupId: parseInt(groupId), userId },
    });
    if (!membership)
      return res.status(400).json({ error: "Not a member of this group." });

    await prisma.membership.delete({
      where: { id: membership.id },
    });
    res.json({ message: "Left group successfully." });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Get all groups a user is a member of
const getUserGroups = async (req, res) => {
  const userId = req.user.id;
  try {
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: { group: true },
    });
    const groups = memberships.map((m) => m.group);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { joinGroup, leaveGroup, getUserGroups };
