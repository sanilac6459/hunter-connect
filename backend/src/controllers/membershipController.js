// handles user memberships as they join and leave clubs, and fetching all clubs a user is a member of

const prisma = require("../prismaClient");

// join a group — adds the user as a member
const joinGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
    const existingMembership = await prisma.membership.findFirst({
      where: { groupId: parseInt(groupId), userId },
    });
    if (existingMembership)
      return res.status(400).json({ error: "Already a member of this group." });

    const membership = await prisma.membership.create({
      data: { userId, groupId: parseInt(groupId), role: "MEMBER" },
    });
    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// leave a group — removes the user as a member
const leaveGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
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

// get all groups the logged in user is a member of
const getUserGroups = async (req, res) => {
  const userId = req.user.id;
  try {
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: { group: true },
    });
    // return just the group info, not the full membership object
    const groups = memberships.map((m) => m.group);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// promote or demote a member — only admins can do this
const updateMemberRole = async (req, res) => {
  const { groupId, userId: targetUserId } = req.params;
  const { role } = req.body;
  const requestingUserId = req.user.id;

  try {
    // check if requesting user is an admin
    const adminMembership = await prisma.membership.findFirst({
      where: {
        groupId: parseInt(groupId),
        userId: requestingUserId,
        role: "ADMIN",
      },
    });
    if (!adminMembership)
      return res
        .status(403)
        .json({ error: "Only admins can change member roles." });

    // make sure role is valid
    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be ADMIN or MEMBER." });
    }

    // find the target member's membership
    const membership = await prisma.membership.findFirst({
      where: { groupId: parseInt(groupId), userId: parseInt(targetUserId) },
    });
    if (!membership)
      return res.status(404).json({ error: "Member not found." });

    // update the role
    const updated = await prisma.membership.update({
      where: { id: membership.id },
      data: { role },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { joinGroup, leaveGroup, getUserGroups, updateMemberRole };
